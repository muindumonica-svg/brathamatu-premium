import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
function makeRouter() {
  return createRouter({ routeTree, context: { queryClient: new QueryClient() } });
}

type RouteInfo = { options: { beforeLoad?: unknown }; parentRoute?: { id: string } };
const routesById = (router: ReturnType<typeof makeRouter>) =>
  router.routesById as unknown as Record<string, RouteInfo | undefined>;

describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const matches = makeRouter().matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("serves the public homepage at / without a sign-in redirect", () => {
    const router = makeRouter();
    const home = router.matchRoutes("/").at(-1);
    expect(home?.routeId).toBe("/");
    expect(routesById(router)["/"]?.options.beforeLoad).toBeUndefined();
  });

  it("keeps every workspace page flat under the root so route IDs equal their URLs", () => {
    const router = makeRouter();
    for (const path of [
      "/pos/terminals",
      "/business/stocktaking/$jobId/review",
      "/platform/marketing/leads/$leadId",
      "/business/catalogue/products/$productId",
    ]) {
      const leaf = router.matchRoutes(path).at(-1);
      expect(leaf?.routeId).toBe(path);
      expect(routesById(router)[path]?.parentRoute?.id).toBe(rootRouteId);
    }
  });

  it("still requires sign-in for workspace pages", () => {
    const router = makeRouter();
    expect(router.matchRoutes("/app").at(-1)?.routeId).toBe("/app");
    expect(routesById(router)["/app"]?.options.beforeLoad).toBeTypeOf("function");
  });
});
