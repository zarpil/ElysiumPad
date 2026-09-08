/**
 * Helper to resolve the correct public origin for redirects and email links.
 * Prevents internal Docker/container addresses (such as 0.0.0.0:3000) from leaking
 * to the browser or email verification links.
 */
export function getPublicOrigin(req?: { headers: { get: (name: string) => string | null } }): string {
  // 1. Check environment variable
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl && !envUrl.includes('0.0.0.0')) {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Extract from reverse-proxy headers (Cloudflare, Coolify, Nginx, Traefik)
  if (req) {
    const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost && !forwardedHost.includes('0.0.0.0')) {
      return `${forwardedProto}://${forwardedHost}`;
    }
  }

  // 3. Fallback: Development vs Production
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return 'https://elysiumpad.com';
}
