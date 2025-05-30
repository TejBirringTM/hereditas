// Copyright 2018-2024 the oak authors. All rights reserved. MIT license.

import { Context, RouteParams, RouterContext, State } from "@oak/oak";

interface GetQueryOptionsBase {
  /** The return value should be a `Map` instead of a record object. */
  asMap?: boolean;

  /** Merge in the context's `.params`.  This only works when a `RouterContext`
   * is passed. */
  mergeParams?: boolean;
}

interface GetQueryOptionsAsMap extends GetQueryOptionsBase {
  /** The return value should be a `Map` instead of a record object. */
  asMap: true;
}

/** Options which can be specified when using {@linkcode getQuery}. */
export type GetParamsOptions = GetQueryOptionsBase | GetQueryOptionsAsMap;

/** Given a context, return the `.request.url.searchParams` as a `Map` of keys
 * and values of the params. */
export function getQuery<
  R extends string,
  P extends RouteParams<R>,
  S extends State,
>(
  ctx: Context<S, S> | RouterContext<R, P, S>,
  options: GetQueryOptionsAsMap,
): Map<string, string>;
/** Given a context, return the `.request.url.searchParams` as a record object
 * of keys and values of the params. */
export function getQuery(
  ctx: Context | RouterContext<string>,
  options?: GetQueryOptionsBase,
): Record<string, string>;
export function getQuery(
  ctx: Context | RouterContext<string>,
  { mergeParams, asMap }: GetParamsOptions = {},
): Map<string, string> | Record<string, string> {
  const result: Record<string, string> = {};
  if (mergeParams && isRouterContext(ctx)) {
    Object.assign(result, ctx.params);
  }
  for (const [key, value] of ctx.request.url.searchParams) {
    result[key] = value;
  }
  return asMap ? new Map(Object.entries(result)) : result;
}

export function isRouterContext<
  R extends string,
  P extends RouteParams<R>,
  S extends State,
>(
  value: Context<S>,
): value is RouterContext<R, P, S> {
  return "params" in value;
}
