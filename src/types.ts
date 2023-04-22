import { Store } from "solid-js/store";
import { JSX } from "solid-js";
import { F, A, S } from "ts-toolbelt";
import { PrefixPathProps } from "solid-typefu-router5/dist/components/Switch";
import { Uuid } from './uuidshim'; 

export interface IParamCodec<A> {
  decode(input: string): A | undefined;
  encode(value: A): string;
}

export interface Param {
  param: string;
  kind: string;
}

export enum RNKind {
  Segment,
  Param,
  Query,
}

export namespace RN {
  export enum Kind {
    Segment,
    Param,
    Query,
  }

  export type Type =
    | Segment<string>
    | Param<string, string>
    | Query<string, string>;

  export interface Segment<Name extends string> {
    kind: Kind.Segment;
    name: Name;
  }

  export interface Param<Name extends string, T extends string> {
    kind: Kind.Param;
    name: Name;
    type: T;
  }

  export interface Query<Name extends string, T extends string> {
    kind: Kind.Query;
    name: Name;
    type: T;
  }

  export type SomeParam<Name extends string, T extends string> =
    | Param<Name, T>
    | Query<Name, T>;

  export type Parse<Name extends string> = 
    Name extends `?${infer S}:${infer T}`
    ? Query<Trim<S>, Trim<T>>
    : Name extends `?${infer S}`
    ? Param<Trim<S>, string>
    : Name extends `.${infer S}:${infer T}`
    ? Param<Trim<S>, Trim<T>>
    : Name extends `.${infer S}`
    ? Param<Trim<S>, "string">
    : Segment<Trim<Name>>;
  
  export function parse(name: string): RN.Type | undefined {
    if (name === '') return undefined;
    if (name[0] === ".") {
      const spl = name.split(":");
      const key = spl[0].trim();
      const ty = spl?.[1]?.trim() ?? "string";
      return {
        kind: RN.Kind.Query,
        name: key,
        type: ty,
      }
    } else if (name[0] === ".") {
      const spl = name.split(":");
      const key = spl[0].trim();
      const ty = spl?.[1]?.trim() ?? "string";
      return {
        kind: RN.Kind.Param,
        name: key,
        type: ty,
      }
    } else {
      return {
        kind: RN.Kind.Segment,
        name: name.trim(),
      }
    }
  }
}

export type _RouteNodes<R, Names extends string[]> = R extends Record<
  string,
  any
>
  ? {
      [Name in keyof R &
        string]: RN.Parse<Name> extends infer Node extends RN.Type
        ? Node &
            (R[Name] extends Record<string, any>
              ? {
                  key: S.Join<[...Names, Node["name"]], "/">;
                  children: _RouteNodes<R[Name], [...Names, Node["name"]]>;
                }
              : {
                  key: S.Join<[...Names, Node["name"]], "/">;
                })
        : never;
    }
  : 0;

export type RouteNodes<R> = _RouteNodes<R, []>;

export type _RouterTypes<R> =
  (R extends { type: infer Type extends string } 
    ? Type
    : never) |
  (R extends { children: Record<string, infer Child>  }
    ? _RouterTypes<Child>
    : never )
 
type RouterTypes<R> = 
  Record<Extract<_RouterTypes<R>, string>, 0>;

export type ParseRouter<R> = RouteNodes<R> extends infer Router
  ? {
      router: Router;
      types: RouterTypes<{ children: Router }>;
    }
  : never;

export type Router = { [k: string]: 0 | Router };

export type SomeParsedRouterNode = (RN.Type & {
  id: number;
  key: string;
  children: Record<string, SomeParsedRouterNode>
}) | {
  kind: "root",
  children: Record<string, SomeParsedRouterNode>
};

export type SomeParsedRouter = {
  router: SomeParsedRouterNode,
  types: Record<string, 0>
}

type ParamTypeMapKind = Record<string, IParamCodec<any>>;

function paramCodec<T>(
  decode: (input: string) => T | undefined,
  encode: (value: T) => string,
): IParamCodec<T> {
  return {encode, decode}
} 

const defaultParamTypeMap = {
  string: paramCodec<string>(i => i, v => v),
  number: paramCodec<number>(
    i => {
      const r = Number.parseFloat(i);
      if (Number.isFinite(r)) return r;
      return undefined;
    },
    v => String(v)  
  ),
  integer: paramCodec<number>(
    i => {
      const r = Number.parseInt(i);
      if (Number.isSafeInteger(r)) return r;
      return undefined;
    },
    v => String(v),
  ),
  natural: paramCodec<number>(
    i => {
      const r = Number.parseInt(i);
      if (Number.isSafeInteger(r) && r >= 0) return r;
      return undefined;
    },
    v => String(v),
  ),
  get uuid() {
    if (Uuid === undefined) {
      throw new Error("solid-cartography error: The 'uuid' package is required for uuid parsing to work");
    }
    return paramCodec<string>(
      i => Uuid!.stringify(Uuid!.parse(i)),
      v => Uuid!.stringify(Uuid!.parse(v))
    )
  },
} as const satisfies ParamTypeMapKind;

function router<
  const R extends Router,
  C extends A.Compute<ParseRouter<R>> = A.Compute<ParseRouter<R>>,
  NeededTypes extends Record<keyof C['types'], IParamCodec<any>> = Record<keyof C['types'], IParamCodec<any>>,
>(
  definition: typeof defaultParamTypeMap extends NeededTypes ? R : 
  `Unsupported param type ${Extract<keyof Omit<NeededTypes, keyof typeof defaultParamTypeMap>, string>}`
): A.Compute<ParseRouter<R>>;

function router<
  const R extends Router,
  C extends A.Compute<ParseRouter<R>> = A.Compute<ParseRouter<R>>,
  NeededTypes extends Record<keyof C['types'], IParamCodec<any>> = Record<keyof C['types'], IParamCodec<any>>,
>(definition: R, typeMap: NeededTypes): A.Compute<ParseRouter<R>>;

function router<
  const R extends Router,
  C extends A.Compute<ParseRouter<R>> = A.Compute<ParseRouter<R>>,
  NeededTypes extends Record<keyof C['types'], IParamCodec<any>> = Record<keyof C['types'], IParamCodec<any>>,
  const TM extends NeededTypes = Extract<typeof defaultParamTypeMap, NeededTypes>
>(
  definition: R, 
  typeMap: TM = defaultParamTypeMap as any as TM
): A.Compute<ParseRouter<R>> {
  const types: Record<string, IParamCodec<unknown>> = {};
  const router: SomeParsedRouterNode = { kind: "root", children: {} };
  let nextId = 0;
  const q: [string, Router, SomeParsedRouterNode][] = [['', definition, router]];
  while (q.length > 0) {
    const [prefix, here, out] = q.pop()!;
    for (const key in here) {
      const rn: RN.Type | undefined = RN.parse(key);
      if (rn === undefined) continue;
      const next = prefix + '/' + rn.name;
      const node: SomeParsedRouterNode = {
        ...rn,
        key: next,
        id: nextId++,
        children: {},
      };
      if (rn.kind === RN.Kind.Param || rn.kind === RN.Kind.Query) {
        if ((types[rn.type] = (typeMap as any)[rn.type]) === undefined) {
          throw new Error("solid-cartography: No codec found for " + rn.type);
        }
      }
      out.children[key] = node;
      const inner = here[key];
      if (inner !== undefined && typeof inner !== 'number') {
        q.push([next, inner, node]);
      }
    }
  }
  return { router, types } as any;
}

////////////////////////////////////////////////////////////////////////////////

export type ParseParamInto<
  P extends string,
  Params extends Record<string, Param> = {}
> = P extends `.${infer Param & string}: ${infer Kind & string}`
  ? Param extends string
    ? Params & { [param in Param]: Kind }
    : undefined
  : undefined;

type ParamKindsOf<O extends Record<string, Param>> = {
  [K in O[keyof O]["kind"]]: null;
};

/****************
 * Utility types
 ****************/

export type Trim<T extends string> = TrimBack<TrimFront<T>>;

export type TrimFront<T extends string> = T extends ` ${infer S}`
  ? TrimFront<S>
  : T;

export type TrimBack<T extends string> = T extends `${infer S} `
  ? TrimBack<S>
  : T;

export type Concat<T, Acc extends string = ""> = T extends [
  infer X,
  ...infer XS
]
  ? Concat<Extract<XS, string[]>, `${Acc}${Extract<X, string>}`>
  : Acc;

export type Intercalate<T, Sep extends string> = T extends [infer X]
  ? X
  : T extends [infer X, ...infer XS]
  ? _Intercalate1<XS, Sep, `${Extract<X, string>}`>
  : "";

export type _Intercalate1<
  T,
  Sep extends string,
  Acc extends string
> = T extends [infer X]
  ? `${Acc}${Sep}${Extract<X, string>}`
  : T extends [infer X, ...infer XS]
  ? _Intercalate1<XS, Sep, `${Acc}${Sep}${Extract<X, string>}`>
  : Acc;
