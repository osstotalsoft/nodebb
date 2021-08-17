import Knex = require('knex')

/**
 *
 * Creates a table predicate that can be used within a filter, that passes if the received table has the specified column
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/knex-filters#buildTableHasColumnPredicate
 */
export function buildTableHasColumnPredicate(
  column: string,
  knex: Knex<any, any>,
): Promise<(table: string) => boolean>
