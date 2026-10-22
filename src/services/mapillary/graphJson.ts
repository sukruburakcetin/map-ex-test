/** Authenticated Mapillary Graph JSON transport shared by runtime features. */

/**
 * Fetch JSON with a 12-second timeout per attempt and at most one transient retry.
 * Uses OAuth request headers. Caller aborts stop retries; HTTP/API failures propagate
 * with their status. Every attempt removes its abort listener and timeout.
 * @param url Graph endpoint or validated pagination URL supplied by the caller.
 * @param accessToken Application access token; never logged by this helper.
 * @param signal Optional caller cancellation signal.
 */
export async function fetchGraphJson(url: string, accessToken: string, signal?: AbortSignal): Promise<any> {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const controller = new AbortController();
      const abort = () => controller.abort(); signal?.addEventListener("abort", abort, { once: true });
      const timeout = setTimeout(abort, 12000);
      try {
        const response = await fetch(url, { headers: { Authorization: `OAuth ${accessToken}` }, signal: controller.signal });
        if (!response.ok) throw Object.assign(new Error(`Mapillary request failed (${response.status})`), { status: response.status });
        const data = await response.json();
        if (data.error) throw Object.assign(new Error("Mapillary could not return image data"), { status: data.error.code === 190 ? 401 : 400 });
        return data;
      } catch (error) {
        if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
        const status = (error as any)?.status;
        const transient = !status && ((error as any)?.name === "TypeError" || (error as any)?.name === "AbortError") || status >= 500;
        if (attempt === 1 || !transient) throw error;
      } finally { clearTimeout(timeout); signal?.removeEventListener("abort", abort); }
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    throw new Error("Mapillary request failed");
  }
