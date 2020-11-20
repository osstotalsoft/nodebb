const { createFilter, registerFilter } = require('../filter')
const { buildTableHasColumnPredicate } = require('../dbSchema/mssql')

async function registerTenancyFilter(knex, columnTenantId, tenantId) {
  const tableHasColumnTenantId = await buildTableHasColumnPredicate(
    columnTenantId,
    knex,
  )

  const addWhereTenantIdClause = (table, queryBuilder) => {
    queryBuilder.andWhere(
      `[${table}].[${columnTenantId}]`,
      '=',
      tenantId,
    )
  }

  const filter = createFilter(tableHasColumnTenantId, {
    onSelect: addWhereTenantIdClause,
    onUpdate: addWhereTenantIdClause,
    onDelete: addWhereTenantIdClause,
    onInsert: (inserted) => {
      inserted[columnTenantId] = tenantId
    },
  })

  registerFilter(filter, knex)
}

module.exports = {
  registerTenancyFilter,
}
