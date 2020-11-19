const { createFilter } = require('./filter')

function tenancyFilter(column, value) {
  return async function _tenancyFilter(knex) {
    const isTenantSpecificTable = await introspectDb(knex)
    const filter = createFilter(isTenantSpecificTable, {
      onSelect: (alias, queryBuilder) => {
        queryBuilder.andWhere(`[${alias}].[${column}]`, '=', value)
      },
      onInsert: (inserted) => {
        inserted[column] = value
      },
    })
    return filter
  }
}

async function introspectDb(knex) {
  return function isTenantSpecificTable(table) {
    return true
  }
}

module.exports = {
    tenancyFilter,
}
