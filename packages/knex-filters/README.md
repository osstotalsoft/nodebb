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
```

## createfilter
While a filter is just a function, you can also create a filter from a table predicate and some hooks
```javascript
const filter = createFilter(
    (table)=> table == 'Products', 
    {
        onSelect: (table, queryBuilder) => {
            queryBuilder.andWhere(`[${table}].[isDeleted]`,'=',false,)
        },
    },
  })
```

## registerFilter
Registers a filter with a Knex instance
```javascript
registerFilter(()=>{
    onInsert: (inserted) => {inserted.CreatedBy = getLoggedInUserId()}
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
```
