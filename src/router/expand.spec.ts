import { expand, Expand } from "./expand";
import { A } from "ts-toolbelt";
import { expect, test } from "@jest/globals";

test("foobar", () => expect(1).toBe(1));

function expandy<A>(a: A, b: Expand<A>): void;

function expandy<A, B>(a: A, b: B, eq: A.Equals<B, Expand<A>>): void;

function expandy<A, B>(a: A, b: B, eq?: 0 | 1): void {
  if (eq === 1 || eq === undefined) {
    expect(expand(a as any)).toBe(b);
  } else {
    expect(expand(a as any)).not.toBe(b);
  }
}

test("a,b", () =>
  expandy({ a: {}, b: {} }, { a: { leaf: true }, b: { leaf: true } }));

test("a/b,b", () =>
  expandy(
    { "a/b": {}, b: {} },
    { a: { b: { leaf: true } }, b: { leaf: true } }
  ));

test("a/b,a.b", () =>
  expandy({ "a/b": {}, a: { b: {} } }, { a: { b: { leaf: true } } }));

test("a/b/c,a/{d,e}", () =>
  expandy(
    { "a/b/c": {}, a: { d: {}, e: {} } },
    { a: { b: { c: { leaf: true } }, d: { leaf: true }, e: { leaf: true } } }
  ));

test("a/b/c,a/{d,e}", () =>
  expandy(
    { "a/b/c": {}, a: { d: {}, e: {} } },
    { a: { b: { c: { leaf: true } }, d: { leaf: true }, e: { leaf: true } } }
  ));
