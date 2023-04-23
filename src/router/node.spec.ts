import * as Node from "./node";
import { A } from "ts-toolbelt";
import { expect, test } from "@jest/globals";

function pt<A extends string>(a: A, b: Node.Parse<A>): void;
function pt<A extends string, B extends string>(
  a: A,
  b: B,
  eq: A.Equals<B, Node.Parse<A>>
): void;
function pt<A extends string, B extends string>(a: A, b: B, eq?: 0 | 1): void {
  if (eq === 1 || eq === undefined) {
    expect(b).toStrictEqual(Node.parse(a));
  } else {
    expect(b).not.toStrictEqual(Node.parse(a));
  }
}

test("what", () => {
  pt("what", Node.Segment("what"));
});

test(".what", () => {
  pt(".what", Node.Param("what"));
});

test(".what: number", () => {
  pt(".what: number", Node.Param("what", "number"));
});

test("?what: number", () => {
  pt("?what: number", Node.Query("what", "number"));
});
