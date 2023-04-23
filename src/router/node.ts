export type Parse<Name> = Name extends string ? _Parse<Name> : Node;
type _Parse<Name extends string> = Name extends `?${infer S}:${infer T}`
  ? Query<Trim<S>, Trim<T>>
  : Name extends `?${infer S}`
  ? Query<Trim<S>, string>
  : Name extends `.${infer S}:${infer T}`
  ? Param<Trim<S>, Trim<T>>
  : Name extends `.${infer S}`
  ? Param<Trim<S>, "string">
  : Segment<Trim<Name>>;

export function parse(name: string): Node;
export function parse<const Name extends string>(name: Name): Parse<Name>;
export function parse<const Name>(name: Name): Parse<Name> {
  if (typeof name !== "string" || name === "") throw new Error("empty route");
  if (name[0] === "?") {
    const spl = name.split(":");
    const key = spl[0].trim();
    const ty = spl?.[1]?.trim() ?? "string";
    return {
      kind: Kind.Query,
      name: key,
      type: ty,
    } as Node as Parse<Name>;
  } else if (name[0] === ".") {
    const spl = name.split(":");
    const key = spl[0].trim();
    const ty = spl?.[1]?.trim() ?? "string";
    return {
      kind: Kind.Param,
      name: key,
      type: ty,
    } as Node as Parse<Name>;
  } else {
    return {
      kind: Kind.Segment,
      name: name.trim(),
    } as Node as Parse<Name>;
  }
}

export type Node =
  | Segment<string>
  | Param<string, string>
  | Query<string, string>;

export enum Kind {
  Segment,
  Param,
  Query,
}

export interface Segment<Name extends string> {
  leaf?: true;
  kind: Kind.Segment;
  name: Name;
}

export interface Param<Name extends string, T extends string> {
  leaf?: true;
  kind: Kind.Param;
  name: `.${Name}`;
  type: T;
}

export interface Query<Name extends string, T extends string> {
  leaf?: true;
  kind: Kind.Query;
  name: `?${Name}`;
  type: T;
}

export type SomeParam<Name extends string, T extends string> =
  | Param<Name, T>
  | Query<Name, T>;

export function Segment<Name extends string>(
  name: Name,
  leaf?: true
): Segment<Name> {
  if (leaf === true) {
    return { leaf: true, kind: Kind.Segment, name };
  }
  return { kind: Kind.Segment, name };
}

export function Param<Name extends string, T extends string = "string">(
  name_: Name,
  type: T = "string" as T,
  leaf?: true
): Param<Name, T> {
  const name = `.${name_}` as const;
  if (leaf === true) {
    return { leaf: true, kind: Kind.Param, name, type };
  }
  return { kind: Kind.Param, name, type };
}

export function Query<Name extends string, T extends string = "string">(
  name_: Name,
  type: T = "string" as T,
  leaf?: true
): Query<Name, T> {
  const name = `?${name_}` as const;
  if (leaf === true) {
    return { leaf: true, kind: Kind.Query, name, type };
  }
  return { kind: Kind.Query, name, type };
}

////////////////////////////////////////////////////////////////////////////////

type Trim<T extends string> = TrimBack<TrimFront<T>>;
type TrimFront<T extends string> = T extends ` ${infer S}` ? TrimFront<S> : T;
type TrimBack<T extends string> = T extends `${infer S} ` ? TrimBack<S> : T;
