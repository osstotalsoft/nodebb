const R = require('ramda')

const getDefaultSchemaAndDbName = async (knex) => {
  const data = await knex.raw(
    'select current_schema() as "schema", current_database() as "db"',
  )
  const schema = data?.rows[0]?.schema
  const db = data?.rows[0]?.db
  return [schema, db]
}

const getTablesWithColumn = async (column, knex) => {
  if (!knex) return null

  const data = await knex
    .distinct('table_name as table', 'table_schema as schema')
    .from('information_schema.columns')
    .where(`column_name`, '=', column.toLowerCase())
  return data
}

const decompose = (tableName) => {
  const components = tableName
    .split('.')
    .map((x) => x.trim().replace(/"/g, ''))

  if (components.length == 1) {
    return [null, null, components[0].toLowerCase()]
  } else if (components.length == 2) {
    return [
      null,
      components[0].toLowerCase(),
      components[1].toLowerCase(),
    ]
  } else {
    return components.map((c) => c.toLowerCase())
  }
}

const buildTableHasColumnPredicate = async (column, knex) => {
  const [defaultSchema, dbName] = await getDefaultSchemaAndDbName(
    knex,
  )

  const tablesWithColumn = await getTablesWithColumn(column, knex)

  const entries = R.compose(
    R.map(([k, v]) => [k, new Set(R.map(R.prop('table'), v))]),
    R.toPairs,
    R.groupBy(R.prop('schema')),
  )(tablesWithColumn)
  const map = new Map(entries)

  return function tableHasColumn(tableName) {
    const [db, _schema, table] = decompose(tableName)
    if (db && db != dbName) {
      return false
    }
    const schema = _schema ?? defaultSchema
    const tableHasColumn =
      map.has(schema) && map.get(schema).has(table)
    return tableHasColumn
  }
}

module.exports = { buildTableHasColumnPredicate }
