import Knex from 'knex'

export function buildTableHasColumnPredicate(column:string, knex: Knex<any, any>): (table: string) => boolean