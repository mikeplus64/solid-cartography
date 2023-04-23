import { A, S } from "ts-toolbelt";
import * as RN from "./node";
import * as Param from "./params";

/** The base type you define a router with */
export type Router = {
  [k: string | `?${string}:${string}` | `.${string}:${string}`]: A.Key | Router;
};

export function router<
  R extends Router,
  C extends A.Compute<ParseRouter<R>> = A.Compute<ParseRouter<R>>,
  NeededTypes extends Record<keyof C["types"], Param.Codec<any>> = Record<
    keyof C["types"],
    Param.Codec<any>
  >
>(
  definition: typeof Param.defaultCodecs extends NeededTypes
    ? R
    : `Unsupported param type ${Extract<
        keyof Omit<NeededTypes, keyof typeof Param.defaultCodecs>,
        string
      >}`
): A.Compute<ParseRouter<R>>;

export function router<
  R extends Router,
  C extends A.Compute<ParseRouter<R>> = A.Compute<ParseRouter<R>>,
  NeededTypes extends Record<keyof C["types"], Param.Codec<any>> = Record<
    keyof C["types"],
    Param.Codec<any>
  >
>(definition: R, paramCodecs: NeededTypes): A.Compute<ParseRouter<R>>;

/** Compile a router into a prefix tree form */
export function router<
  R extends Router,
  C extends A.Compute<ParseRouter<R>> = A.Compute<ParseRouter<R>>,
  NeededTypes extends Record<keyof C["types"], Param.Codec<any>> = Record<
    keyof C["types"],
    Param.Codec<any>
  >,
  TM extends NeededTypes = Extract<typeof Param.defaultCodecs, NeededTypes>
>(
  definition: R,
  paramCodecs: TM = Param.defaultCodecs as any as TM
): A.Compute<ParseRouter<R>> {
  const types: Record<string, Param.Codec<unknown>> = {};
  const router: SomeParsedRouterNode = { kind: "root", children: {} };
  let nextId = 0;
  const q: [string, Router, SomeParsedRouterNode][] = [
    ["", definition, router],
  ];
  while (q.length > 0) {
    const [prefix, here, out] = q.pop()!;
    for (const key in here) {
      const rn: RN.Node | undefined = RN.parse(key);
      if (rn === undefined) continue;
      const next = prefix + "/" + rn.name;
      const node: SomeParsedRouterNode = {
        ...rn,
        key: next,
        id: nextId++,
        children: {},
      };
      if (rn.kind === RN.Kind.Param || rn.kind === RN.Kind.Query) {
        if ((types[rn.type] = (paramCodecs as any)[rn.type]) === undefined) {
          throw new Error("solid-cartography: No codec found for " + rn.type);
        }
      }
      out.children[key] = node;
      const inner = here[key];
      if (typeof inner === "object") {
        q.push([next, inner, node]);
      }
    }
  }
  return { router, types } as any;
}

////////////////////////////////////////////////////////////////////////////////

/** ParseRouter<R: Router>: SomeParsedRouter */
export type ParseRouter<R extends Router> = RouteNodes<R> extends infer Parsed
  ? {
      router: Parsed;
      types: RouterTypes<{ children: Router }>;
    }
  : never;

/** RouteNodes<R: Router>: SomeParsedRouterNode */
export type RouteNodes<R extends Router> = _RouteNodes<R, []>;

type _RouteNodes<R, Names extends string[]> = R extends Record<string, any>
  ? {
      [Name in keyof R &
        string]: RN.Parse<Name> extends infer Node extends RN.Node
        ? Node extends RN.Node
          ? Node &
              (R[Name] extends Record<string, any>
                ? {
                    key: S.Join<[...Names, Node["name"]], "/">;
                    children: _RouteNodes<R[Name], [...Names, Node["name"]]>;
                  } & IsLeaf<R[Name]>
                : {
                    leaf: true;
                    key: S.Join<[...Names, Node["name"]], "/">;
                  })
          : never
        : never;
    }
  : 0;

type IsLeaf<L> = L extends { leaf: true } ? { leaf: true } : {};

export type RouterTypes<R> = Record<Extract<_RouterTypes<R>, string>, 0>;
type _RouterTypes<R> =
  | (R extends { type: infer Type extends string } ? Type : never)
  | (R extends { children: Record<string, infer Child> }
      ? _RouterTypes<Child>
      : never);

////////////////////////////////////////////////////////////////////////////////
//
// Monomorphised versions of the return types of @ParseRouter@ and @RouteNodes@
//
// I.e. @ParseRouter<X>@ extends @SomeParsedRouter@ is true
//
////////////////////////////////////////////////////////////////////////////////

export type SomeParsedRouter = {
  router: SomeParsedRouterNode;
  types: Record<string, 0>;
};

export type SomeParsedRouterNode =
  | (RN.Node & {
      id: number;
      key: string;
      children: Record<string, SomeParsedRouterNode>;
    })
  | {
      kind: "root";
      children: Record<string, SomeParsedRouterNode>;
    };
