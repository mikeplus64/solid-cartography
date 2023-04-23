import * as Node from "./node";
import { A } from "ts-toolbelt";
import { expect, test } from "@jest/globals";

function parseTest<A extends string>(a: A, b: Node.Parse<A>): void;

function parseTest<A extends string, B extends string>(
  a: A,
  b: B,
  eq: A.Equals<B, Node.Parse<A>>
): void;

function parseTest<A extends string, B extends string>(
  a: A,
  b: B,
  eq?: 0 | 1
): void {
  if (eq === 1 || eq === undefined) {
    expect(Node.parse(a as any)).toBe(b);
  } else {
    expect(Node.parse(a as any)).not.toBe(b);
  }
}

test("what", () => {
  parseTest("what", Node.Segment("what"));
});
