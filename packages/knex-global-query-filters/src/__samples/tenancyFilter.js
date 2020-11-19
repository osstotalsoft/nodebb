const { createFilter, registerFilter } = require('../filter')
const { buildTableHasColumnPredicate } = require('../dbSchema')

async function registerTenancyFilter(knex, columnTenantId, tenantId) {
  const tableHasColumnTenantId = await buildTableHasColumnPredicate(
    columnTenantId,
    knex,
  )
  const filter = createFilter(tableHasColumnTenantId, {
    onSelect: (table, queryBuilder) => {
      queryBuilder.andWhere(
        `[${table}].[${columnTenantId}]`,
        '=',
        tenantId,
      )
    },
    onInsert: (inserted) => {
      inserted[columnTenantId] = tenantId
    },
  })

  registerFilter(filter, knex)
}

module.exports = {
  registerTenancyFilter,
}
