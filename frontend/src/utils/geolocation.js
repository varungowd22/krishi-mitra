export function getCurrentLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("This browser does not support location access."));
  }

  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const isSecureContext = window.isSecureContext === true || window.location.protocol === "https:" || isLocalhost;
  if (!isSecureContext) {
    return Promise.reject(new Error(
      "GPS requires a secure HTTPS site on phones. Open the hosted Krishi Mitra HTTPS link, or use your phone's location settings."
    ));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission is blocked. Allow location access for this site in your browser and turn on Location Services."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Your phone could not determine its location. Turn on Location Services and try again outdoors or near a window."
            : "Location lookup timed out. Check your GPS signal and try again.";
        reject(new Error(message));
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 },
    );
  });
}
