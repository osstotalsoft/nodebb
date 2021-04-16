import Knex = require('knex')

export interface Hooks {
  onSelect?: (
    table: string,
    alias: string,
    queryBuilder: Knex.QueryBuilder,
    clause: Knex.JoinClause | { table: string; only: boolean },
  ) => void
  onInsert?: (
    table: string,
    alias: string,
    queryBuilder: Knex.QueryBuilder,
    inserted: any,
  ) => void
  onUpdate?: (
    table: string,
    alias: string,
    queryBuilder: Knex.QueryBuilder,
    updates: any,
  ) => void
  onDelete?: (
    table: string,
    alias: string,
    queryBuilder: Knex.QueryBuilder,
  ) => void
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
