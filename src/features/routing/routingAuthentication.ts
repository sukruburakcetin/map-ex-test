interface RoutingPortal {
  load(): Promise<unknown>;
  helperServices?: { route?: { url?: string } | null } | null;
}

type RoutingPortalConstructor = new () => RoutingPortal;

/** Discover once through the host SDK; failures retain the existing warning/null fallback. */
export async function discoverPortalRoutingService(
  loadPortalModules: () => Promise<RoutingPortalConstructor[]>,
  warn: (...args: unknown[]) => void,
): Promise<string | null> {
  try {
    const [Portal] = await loadPortalModules();

    const portal = new Portal();

    await portal.load();

    const routeUrl = portal.helperServices?.route?.url;

    return routeUrl || null;
  } catch (error) {
    warn("[CaptureRoute] " + "Could not discover portal route service:", error);

    return null;
  }
}

/** Preserve status precedence and the existing broad message matching. */
export function isRoutingAuthenticationFailure(error: any): boolean {
  const status = Number(error?.details?.httpStatus ?? error?.response?.status ?? error?.status ?? error?.code);

  if (status === 401 || status === 403 || status === 498 || status === 499) {
    return true;
  }

  const message = String(error?.message ?? error?.details?.message ?? error ?? "").toLowerCase();

  return (
    message.includes("token") ||
    message.includes("credential") ||
    message.includes("authentication") ||
    message.includes("unauthorized") ||
    message.includes("not authorized") ||
    message.includes("forbidden")
  );
}
