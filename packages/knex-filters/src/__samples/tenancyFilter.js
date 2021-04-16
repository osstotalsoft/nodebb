const { createFilter, registerFilter } = require('../filter')
const { buildTableHasColumnPredicate } = require('../dbSchema/mssql')

async function registerTenancyFilter(columnTenantId, tenantId, knex) {
  const tableHasColumnTenantId = await buildTableHasColumnPredicate(
    columnTenantId,
    knex,
  )

  const addWhereTenantIdClause = (table, alias, queryBuilder) => {
    queryBuilder.andWhere(
      `[${alias ?? table}].[${columnTenantId}]`,
      '=',
      tenantId,
    )
  }

  const addOnTenantIdClause = (
    table,
    alias,
    _queryBuilder,
    joinClause,
  ) => {
    joinClause.andOnVal(
      `[${alias ?? table}].[${columnTenantId}]`,
      '=',
      tenantId,
    )
  }

  const filter = createFilter(tableHasColumnTenantId, {
    onSelect: (table, alias, queryBuilder, clause) => {
      const leftJoinTypes = ['left', 'left outer']
      if (leftJoinTypes.includes(clause.joinType)) {
        addOnTenantIdClause(table, alias, queryBuilder, clause)
      } else {
        addWhereTenantIdClause(table, alias, queryBuilder)
      }
    },
    onUpdate: addWhereTenantIdClause,
    onDelete: addWhereTenantIdClause,
    onInsert: (_table, _alias, _queryBuilder, inserted) => {
      inserted[columnTenantId] = tenantId
    },
  })

  registerFilter(filter, knex)
}

module.exports = {
  registerTenancyFilter,
}
