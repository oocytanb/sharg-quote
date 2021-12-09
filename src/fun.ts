/*! SPDX-License-Identifier: MIT */

export function identity<A>(a: A): A {
  return a;
}

export function constant<A>(a: A): () => A {
  return () => a;
}
