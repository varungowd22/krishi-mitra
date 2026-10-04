import api from "./api.js";

const STORAGE_PREFIX = "km_workspace:";
const PENDING_PREFIX = "km_pending_sync:";
const SYNC_INTERVAL_MS = 30_000;
const syncPromises = new Map();

function getAccountScope() {
  const storedUser = localStorage.getItem("km_user");
  if (!storedUser) return null;
  const user = JSON.parse(storedUser);
  let identifier = user._id || user.id || localStorage.getItem("km_workspace_identity");
  if (!identifier && user.phone) {
    identifier = user.phone;
    localStorage.setItem("km_workspace_identity", String(identifier));
  }
  return identifier ? `${user.role || "user"}:${identifier}` : null;
}

export function setWorkspaceIdentity(user) {
  const identifier = user?._id || user?.id || user?.phone;
  if (identifier) localStorage.setItem("km_workspace_identity", String(identifier));
}

function readJson(key, fallback) {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Could not read saved Krishi Mitra data from ${key}.`, error);
    throw error;
  }
}

function createRevision() {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function storeWorkspace(scope, module, data) {
  const key = `${STORAGE_PREFIX}${scope}`;
  const saved = readJson(key, {});
  saved[module] = data;
  localStorage.setItem(key, JSON.stringify(saved));
}

function storePending(scope, pending) {
  localStorage.setItem(`${PENDING_PREFIX}${scope}`, JSON.stringify(pending));
}

function getPending(scope) {
  return readJson(`${PENDING_PREFIX}${scope}`, { modules: {}, profile: null });
}

function updateLocalProfile(scope, profile) {
  const storedUser = localStorage.getItem("km_user");
  const currentUser = storedUser ? JSON.parse(storedUser) : {};
  const updatedUser = { ...currentUser, ...profile };
  localStorage.setItem("km_user", JSON.stringify(updatedUser));
  return updatedUser;
}

async function flushAccount(scope) {
  const current = syncPromises.get(scope);
  if (current) return current;

  const syncPromise = (async () => {
    if (!localStorage.getItem("km_token") || getAccountScope() !== scope) return;
    const pending = getPending(scope);
    const queuedModules = Object.entries(pending.modules || {});

    for (const [module, queued] of queuedModules) {
      if (queued.failed) continue;
      try {
        await api.put(`/workspace/${module}`, { data: queued.data });
        const latestPending = getPending(scope);
        if (latestPending.modules?.[module]?.revision === queued.revision) {
          delete latestPending.modules[module];
          storePending(scope, latestPending);
        }
      } catch (error) {
        if (error.response?.status && error.response.status < 500 && error.response.status !== 408 && error.response.status !== 429) {
          console.error(`Could not sync saved ${module} data.`, error);
          const latestPending = getPending(scope);
          if (latestPending.modules?.[module]?.revision === queued.revision) {
            latestPending.modules[module].failed = true;
            storePending(scope, latestPending);
          }
        }
        return;
      }
    }

    if (pending.profile && !pending.profile.failed) {
      try {
        const { data } = await api.put("/users/profile", pending.profile.data);
        const latestPending = getPending(scope);
        if (latestPending.profile?.revision === pending.profile.revision) {
          const currentUser = readJson("km_user", {});
          localStorage.setItem("km_user", JSON.stringify({ ...currentUser, ...data }));
          latestPending.profile = null;
          storePending(scope, latestPending);
        }
      } catch (error) {
        if (error.response?.status && error.response.status < 500 && error.response.status !== 408 && error.response.status !== 429) {
          console.error("Could not sync saved profile changes.", error);
          const latestPending = getPending(scope);
          if (latestPending.profile?.revision === pending.profile.revision) {
            latestPending.profile.failed = true;
            storePending(scope, latestPending);
          }
        }
      }
    }
  })().finally(() => syncPromises.delete(scope));

  syncPromises.set(scope, syncPromise);
  return syncPromise;
}

export const loadWorkspace = async (module) => {
  const scope = getAccountScope();
  if (!scope) return null;

  const saved = readJson(`${STORAGE_PREFIX}${scope}`, {});
  const pending = getPending(scope);
  if (pending.modules?.[module]) {
    void flushAccount(scope);
    return pending.modules[module].data;
  }

  let data;
  try {
    ({ data } = await api.get(`/workspace/${module}`));
  } catch (error) {
    if (error.response?.status && error.response.status < 500 && error.response.status !== 408 && error.response.status !== 429) {
      console.error(`Could not load saved ${module} data.`, error);
      throw error;
    }
    return Object.hasOwn(saved, module) ? saved[module] : null;
  }
  storeWorkspace(scope, module, data);
  return data;
};

export const saveWorkspace = async (module, data) => {
  const scope = getAccountScope();
  if (!scope) throw new Error("Sign in to save your farm data on this device.");

  const pending = getPending(scope);
  pending.modules ||= {};
  pending.modules[module] = { data, revision: createRevision() };
  storePending(scope, pending);
  storeWorkspace(scope, module, data);
  void flushAccount(scope);
  return data;
};

export const saveProfile = async (profile) => {
  const scope = getAccountScope();
  if (!scope) throw new Error("Sign in to save your profile on this device.");

  const pending = getPending(scope);
  pending.profile = {
    data: { ...(pending.profile?.data || {}), ...profile },
    revision: createRevision(),
  };
  storePending(scope, pending);
  const updatedUser = updateLocalProfile(scope, profile);
  void flushAccount(scope);
  return updatedUser;
};

export function startWorkspaceSync() {
  const sync = syncCurrentWorkspace;
  const interval = window.setInterval(sync, SYNC_INTERVAL_MS);
  window.addEventListener("online", sync);
  sync();

  return () => {
    window.clearInterval(interval);
    window.removeEventListener("online", sync);
  };
}

export function syncCurrentWorkspace() {
  const scope = getAccountScope();
  if (scope) void flushAccount(scope);
}
