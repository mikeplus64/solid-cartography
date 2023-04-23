import { O, S, A, U } from "ts-toolbelt";

export type Expand<R> = A.Compute<_Expand<R>>;

type _Expand<R> = R extends object
  ? keyof R extends never
    ? {}
    : _Expand1<R> extends infer E
    ? U.IntersectOf<E[keyof E]>
    : never
  : { value: R };

type _Expand1<R> = {
  [SourceKey in keyof R & string]: S.Split<
    SourceKey,
    "/"
  > extends infer K extends string[]
    ? R[SourceKey] extends infer Value extends object
      ? O.P.Record<K, { leaf: true } & _Expand<Value>>
      : R[SourceKey]
    : never;
};

/**
 * 'Expand' a record by splitting keys that have slashes in them, and mark the
 * leaf nodes in the return record
 */
export function expand<R extends object>(i0: R): Expand<R> {
  const r: any = {};
  const q: [string[], any][] = [[[], i0]];
  while (q.length > 0) {
    const [pfix, i] = q.pop()!;
    if (typeof i !== "object" && i !== null) continue;
    for (const k in i) {
      setPath([...pfix, ...k.split("/")], i[k]);
      q.push([[...pfix, k], i[k]]);
    }
  }
  function setPath(path: string[], value: any) {
    let h = r;
    let i = 0;
    for (; i < path.length - 1; i++) {
      const cmp = path[i];
      h = h[cmp] ?? (h[cmp] = {});
    }
    const cmp = path[i];
    const cur = h[cmp];
    h[cmp] =
      typeof value === "object" && value !== undefined
        ? { ...cur, leaf: true, ...value }
        : { ...cur, leaf: true, value };
  }
  return r;
}
