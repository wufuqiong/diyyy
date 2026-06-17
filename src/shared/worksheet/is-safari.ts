/**
 * Detects Safari (including iOS Safari) via user-agent string.
 * Must exclude Chrome/Chromium/Edge which also contain "Safari" in their UA.
 */
export function isSafari(): boolean {
  const ua = navigator.userAgent;
  return (
    ua.includes('Safari') &&
    !ua.includes('Chrome') &&
    !ua.includes('Chromium') &&
    !ua.includes('Edg')
  );
}
