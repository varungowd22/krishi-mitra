import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import FarmerDashboard from "./pages/farmer/FarmerDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import VendorDashboard from "./pages/vendor/VendorDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BlueprintDashboard from "./pages/BlueprintDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allow={["farmer"]}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allow={["vendor"]}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/blueprint" element={<BlueprintDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (user) {
    const ROLE_ROUTES = {
      farmer: "/farmer",
      admin: "/admin",
      vendor: "/vendor",
    };
    return <Navigate to={ROLE_ROUTES[user.role] || "/login"} replace />;
  }
  return <Navigate to="/login" replace />;
}
