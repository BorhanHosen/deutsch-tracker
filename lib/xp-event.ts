// Call this after any action that earns XP
export function dispatchXPUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("xp-updated"));
  }
}
