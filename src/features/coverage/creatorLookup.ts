/** Cached creator-ID resolution for coverage username filters. */
import { GRAPH_API } from '../../utils/constants';

/**
 * Resolve one username through the existing image/creator query and cache its result.
 * Cached nulls and non-OK HTTP responses remain negative cache entries; thrown
 * request/parse failures return null without populating the cache. No retries added.
 * @param cache Widget-owned creator cache, retained across calls.
 */
export async function resolveCreatorId(username: string, accessToken: string, cache: Map<string, number | null>): Promise<number | null> {
    if (!username) return null;
    if (cache.has(username)) return cache.get(username)!;
    const url = `${GRAPH_API.BASE}/images?creator_username=${username}&limit=1&fields=creator&access_token=${accessToken}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        cache.set(username, null);
        return null;
      }
      const data = await response.json();
      const id = data.data?.length > 0 ? parseInt(data.data[0].creator.id, 10) : null;
      cache.set(username, id);
      return id;
    } catch {
      return null;
    }
  }
