
export const CONFIG = {
  // Membership API endpoint (handled by Express server)
  MEMBERSHIP_API: process.env.VITE_MEMBERSHIP_API || "/api/membership/user"
};

console.log("App Config loaded:", { 
  MEMBERSHIP_API: CONFIG.MEMBERSHIP_API
});
