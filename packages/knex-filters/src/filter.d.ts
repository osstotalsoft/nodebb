// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

import Knex = require('knex');

export interface FromClause {
  table: string
  only: boolean
}
export type FromHook = (
  table: string,
  alias: string,
  queryBuilder: Knex.QueryBuilder,
  clause: FromClause,
) => void

export type JoinHook = (
  table: string,
  alias: string,
  queryBuilder: Knex.QueryBuilder,
  clause: Knex.JoinClause,
) => void
export interface AdvancedSelectHooks {
  from: FromHook
  innerJoin: JoinHook
  leftJoin: JoinHook
  rightJoin: JoinHook
  fullOuterJoin: JoinHook
  crossJoin: JoinHook
}

export type SimpleSelectHook = (
  table: string,
  alias: string,
  queryBuilder: Knex.QueryBuilder,
  clause: FromClause | Knex.JoinClause,
) => void

export type InsertHook = (
  table: string,
  alias: string,
  queryBuilder: Knex.QueryBuilder,
  inserted: any,
) => void

export type UpdateHook = (
  table: string,
  alias: string,
  queryBuilder: Knex.QueryBuilder,
  updates: any,
) => void

export type DeleteHook = (
  table: string,
  alias: string,
  queryBuilder: Knex.QueryBuilder,
) => void

export interface Hooks {
  onSelect?: SimpleSelectHook | AdvancedSelectHooks
  onInsert?: InsertHook
  onUpdate?: UpdateHook
  onDelete?: DeleteHook
}

export type Filter = (table: string) => Hooks

/**
 *
 * Creates a filter that will call the hooks when the tablePredicate passes
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/knex-filters#createfilter
 */
export function createFilter(
  tablePredicate: (table: string) => boolean,
  hooks: Hooks,
): Filter

/**
 *
 * Registers a filter with a Knex instance
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/knex-filters#registerFilter
 */
export function registerFilter(
  filter: Filter,
  knex: Knex<any, any>,
): void
