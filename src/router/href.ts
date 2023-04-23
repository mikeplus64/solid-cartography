import { SomeParsedRouter, SomeParsedRouterNode } from "./router";
import * as RN from "./node";

namespace href {
  const QUERY_REGEX = /()/;
  export function parse(
    router: SomeParsedRouter,
    pathname: string,
    search: URLSearchParams
  ) {
    const path = pathname.split("/").map(decodeURIComponent);
    const q = [router.router];
    let i = 0,
    let p: string;
    let h: SomeParsedRouterNode;
    while (q.length > 0 && i < path.length - 1) {
      h = q.pop()!;
      p = path[i];
      switch (h.kind) {
        case RN.Kind.Segment:
          h.children
          continue;

        case RN.Kind.Param:
        case RN.Kind.Query:
          continue;
      }
    }
  }
}
