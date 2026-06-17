// Helper to force session refresh after XP changes
export async function refreshSession() {
  // Trigger a session update by calling the
  // NextAuth session endpoint
  await fetch("/api/auth/session", {
    method: "GET",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  // Force NextAuth to refetch from server
  const event = new Event("visibilitychange");
  document.dispatchEvent(event);
}
