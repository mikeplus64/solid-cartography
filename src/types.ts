import { Store } from "solid-js/store";
import { JSX } from "solid-js";
import { F, Any, Object, String, Union, L, List, S } from "ts-toolbelt";
import { PrefixPathProps } from "solid-typefu-router5/dist/components/Switch";

////////////////////////////////////////////////////////////////////////////////

export interface Codec<A> {
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
    | Param<string, any>
    | Query<string, any>;

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

  export type Parse<Name extends string> = Name extends `?${infer S}:${infer T}`
    ? Query<Trim<S>, Trim<T>>
    : Name extends `.${infer S}:${infer T}`
    ? Param<Trim<S>, Trim<T>>
    : Name extends `.${infer S}`
    ? Param<Trim<S>, "string">
    : Segment<Trim<Name>>;
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
                  id: S.Join<[...Names, Node["name"]], "/">;
                  children: _RouteNodes<R[Name], [...Names, Node["name"]]>;
                }
              : {
                  id: S.Join<[...Names, Node["name"]], "/">;
                })
        : never;
    }
  : 0;

export type RouteNodes<R> = { children: _RouteNodes<R, []> };

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type RouterTypes<R> = Any.Compute<
  UnionToIntersection<
    (R extends RN.SomeParam<any, infer Type> ? { [T in Type]: 0 } : {}) &
      (R extends { children: infer Children }
        ? RouterTypes<Children[keyof Children]>
        : {})
  >,
  "flat"
>;

type G = RouterTypes<{
  children: {
    foo: RN.Param<"id", "integer">;
    bar: RN.Param<"id", "string"> & {
      children: {
        test: RN.Param<"id", "wibbly">;
      };
    };
  };
}>;

export type ParseRouter<R> = RouteNodes<R> extends infer Router
  ? {
      router: Router;
      types: RouterTypes<Router>;
    }
  : never;

type Router = { [k: string]: 0 | Router };

type TypeMapKind = Record<string, Codec<any>>;

const defaultTypeMap = {
  string: {
    decode: i => i,
    encode: i => i,
  },
} satisfies TypeMapKind;

function router<
  const R extends Router,
  TM extends TypeMapKind,
  C extends Any.Compute<ParseRouter<R>> = Any.Compute<ParseRouter<R>>,
>(
  definition: R, 
  typeMap: TM = defaultTypeMap as any as TM
): Any.Compute<ParseRouter<R>> {
  const params = [];
  const paramTypes = [];
  return undefined as any;
}

const r = router({
  cups: {
    cup: {
      ".id: integer": 0,
      ".foobar: number": 0,
    },
  },
})


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
