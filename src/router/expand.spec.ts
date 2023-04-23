import { expand, Expand } from "./expand";
import { A } from "ts-toolbelt";
import { expect, test } from "@jest/globals";

function ex<A>(a: A, b: Expand<A>): void;
function ex<A, B>(a: A, b: B, eq: A.Equals<B, Expand<A>>): void;
/** ex(A,B) tests that expand(A) == B, _and_ Expand<typeof A> == typeof B */
function ex<A, B>(a: A, b: B, eq?: 0 | 1): void {
  if (eq === 1 || eq === undefined) {
    expect(b).toStrictEqual(expand(a as any));
  } else {
    expect(b).not.toStrictEqual(expand(a as any));
  }
}

test("a,b", () => {
  ex({ a: {}, b: {} }, { a: { leaf: true }, b: { leaf: true } });
});

test("a/b,b", () => {
  ex({ "a/b": {}, b: {} }, { a: { b: { leaf: true } }, b: { leaf: true } });
});

test("a/b,a.b", () => {
  ex({ "a/b": {}, a: { b: {} } }, { a: { leaf: true, b: { leaf: true } } });
});

test("a/b/c,a/{d,e}", () => {
  ex(
    { "a/b/c": {}, a: { d: {}, e: {} } },
    {
      a: {
        leaf: true,
        b: { c: { leaf: true } },
        d: { leaf: true },
        e: { leaf: true },
      },
    }
  );
});

test("a/b/c,a/{d,e}", () => {
  ex(
    { "a/b/c": {}, a: { d: {}, e: {} } },
    {
      a: {
        leaf: true,
        b: { c: { leaf: true } },
        d: { leaf: true },
        e: { leaf: true },
      },
    }
  );
});
