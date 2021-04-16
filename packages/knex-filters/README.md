# knex-filters
Knex filters

## installation
```javascript
npm install @totalsoft/knex-filters
```

## philosophy
With knex-filters you can register some hooks for some or any of your tables, that will be called when specific DDL statements occur: select, insert, update, delete.

## filter
A filter is a function that receives a table and returns the hooks
```javascript
export type Filter = (table: string) => Hooks
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
```

## createfilter
While a filter is just a function, you can also create a filter from a table predicate and some hooks
```javascript
const filter = createFilter(
    (table)=> table == 'Products', 
    {
        onSelect: (table, alias, queryBuilder, clause) => {
            queryBuilder.andWhere(`[${alias ?? table}].[isDeleted]`,'=',false,)
        },
    },
  })
```

## registerFilter
Registers a filter with a Knex instance
```javascript
registerFilter(()=>{
    onInsert: (table, alias, queryBuilder, inserted) => {inserted.CreatedBy = getLoggedInUserId()}
}, knex)
```

## buildTableHasColumnPredicate
Creates a table predicate that can be used within a filter, that passes if the received table has the specified column
```javascript
const tableHasColumnIsDeleted = await buildTableHasColumnPredicate(
    'IsDeleted',
    knex,
  )
const filter = createFilter(tableHasColumnIsDeleted, softDeletesHooks)
```

## Example: tenancy filter
```javascript
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
```
