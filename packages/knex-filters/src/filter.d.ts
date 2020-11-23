import Knex = require('knex')

export interface Hooks {
  onSelect?: (
    tableOrAlias: string,
    queryBuilder: Knex.QueryBuilder,
  ) => void
  onInsert?: (inserted: any, queryBuilder: Knex.QueryBuilder) => void
  onUpdate?: (
    tableOrAlias: string,
    queryBuilder: Knex.QueryBuilder,
    updates: any,
  ) => void
  onDelete?: (
    tableOrAlias: string,
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
