import { Uuid } from "../uuidshim";

export type IParamTypeMap = Record<string, Codec<any>>;

export interface Param {
  param: string;
  kind: string;
}

export interface Codec<T> {
  encode(value: T): string;
  decode(input: string): T | undefined;
}

/** Declare a codec */
export function codec<T>(
  decode: (input: string) => T | undefined,
  encode: (value: T) => string
): Codec<T> {
  return { encode, decode };
}

/** Default supported codecs for parameters */
export const defaultCodecs = {
  string: codec<string>(
    (i) => i,
    (v) => v
  ),
  number: codec<number>(
    (i) => {
      const r = Number.parseFloat(i);
      if (Number.isFinite(r)) return r;
      return undefined;
    },
    (v) => String(v)
  ),
  integer: codec<number>(
    (i) => {
      const r = Number.parseInt(i);
      if (Number.isSafeInteger(r)) return r;
      return undefined;
    },
    (v) => String(v)
  ),
  natural: codec<number>(
    (i) => {
      const r = Number.parseInt(i);
      if (Number.isSafeInteger(r) && r >= 0) return r;
      return undefined;
    },
    (v) => String(v)
  ),
  get uuid() {
    if (Uuid === undefined) {
      throw new Error(
        "solid-cartography error: The 'uuid' package is required for uuid parsing to work"
      );
    }
    return codec<string>(
      (i) => Uuid!.stringify(Uuid!.parse(i)),
      (v) => Uuid!.stringify(Uuid!.parse(v))
    );
  },
} as const satisfies IParamTypeMap;
