import Knex from 'knex'

export interface Hooks {
  onSelect?: (
    tableOrAlias: string,
    queryBuilder: Knex.QueryBuilder<any, any>,
  ) => void
  onInsert?: (inserted: any, queryBuilder: Knex.QueryBuilder) => void
  onUpdate?: (
    tableOrAlias: string,
    queryBuilder: Knex.QueryBuilder<any, any>,
    updates: any,
  ) => void
  onDelete?: (
    tableOrAlias: string,
    queryBuilder: Knex.QueryBuilder<any, any>,
  ) => void
}

export type Filter = (table: string) => Hooks

export function createFilter(
  tablePredicate: (table: string) => boolean,
  hooks: Hooks,
): Filter

export function registerFilter(
  filter: Filter,
  knex: Knex<any, any>,
): void
