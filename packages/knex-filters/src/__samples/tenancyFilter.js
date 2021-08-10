// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

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
    onSelect: {
      from: addWhereTenantIdClause,
      innerJoin: addWhereTenantIdClause,
      leftJoin: addOnTenantIdClause,
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
