import { A, L, O } from "ts-toolbelt";

/**
 * Ensure the input arguments have no duplicate members, returns a dictionary.
 */
export default function set<Set extends readonly A.Key[]>(
  ...args: Set
): IsSet<Set> extends 1 ? AsSet<Set> : undefined {
  const r: Record<A.Key, number> = {};
  for (let i = 0; i < args.length; i++) {
    r[args[i]] = i;
  }
  return r as any;
}

export type IsSet<L extends readonly A.Key[]> =
  L.ObjectOf<L> extends infer Inverted extends { [P in keyof Inverted]: A.Key }
    ? O.Invert<Inverted> extends never
      ? 0
      : 1
    : 0;

export type AsSet<L extends readonly A.Key[]> =
  L.ObjectOf<L> extends infer Inverted extends { [P in keyof Inverted]: A.Key }
    ? O.Invert<Inverted> extends infer I
      ? I extends never
        ? never
        : {
            [K in keyof I]: I[K] extends `${infer N extends number}`
              ? N
              : never;
          }
      : never
    : never;
