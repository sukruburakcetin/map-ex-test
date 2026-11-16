/** Read a cached credential for the configured service only. Never signs in, requests
 * tokens, reads the Client ID, infers a role, or treats missing identity as anonymous. */
export interface EnterpriseIdentityManager {
  findCredential(url: string): { userId?: string; expires?: number } | undefined;
  on?(name: string, callback: () => void): { remove(): void };
}
export function enterpriseAccount(manager: EnterpriseIdentityManager, url: string, now = Date.now()): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || !/\/FeatureServer\/\d+\/?$/i.test(parsed.pathname)) return null;
    const credential = manager.findCredential(parsed.href);
    if (!credential || typeof credential.expires === 'number' && (!Number.isFinite(credential.expires) || credential.expires <= now)) return null;
    return typeof credential.userId === 'string' && credential.userId.trim() && credential.userId.length <= 256 ? credential.userId.trim() : null;
  } catch { return null; }
}
