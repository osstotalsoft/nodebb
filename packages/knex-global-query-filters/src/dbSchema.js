const R = require('ramda')

async function getTablesWithColumn(column, knex) {
  const data = await knex
    .select('t.name as [table]', 's.name as [schema]')
    .from('sys.tables as t')
    .join('sys.schemas as s', 't.schema_id', 's.schema_id')
    .whereExists(function () {
      this.select('*')
        .from('sys.columns as c')
        .whereRaw('c.object_id = t.object_id')
        .andWhere(`c.name`, '=', column)
    })
  return data
}

async function getDefaultSchemaAndDbName(knex) {
  const data = await knex.raw(
    'select SCHEMA_NAME() as [schema], DB_NAME() as [db]',
  )
  return [data[0].schema, data[0].db]
}

function decompose(tableName) {
  const components = tableName
    .split('.')
    .map((x) => x.trim().replace('[', '').replace(']', ''))

  if (components.length == 1) {
    return [null, null, components[0]]
  } else if (components.length == 2) {
    return [null, components[0], components[1]]
  } else {
    return components
  }
}

async function buildTableHasColumnPredicate(column, knex) {
  const [defaultSchema, dbName] = await getDefaultSchemaAndDbName(
    knex,
  )
  const tbls = await getTablesWithColumn(column, knex)

  const entries = R.compose(
    R.map(([k, v]) => [k, new Set(R.map(R.prop('table'), v))]),
    R.toPairs,
    R.groupBy(R.prop('schema')),
  )(tbls)
  const map = new Map(entries)

  return function tableHasColumn(tableName) {
    const [db, _schema, table] = decompose(tableName)
    if (db && db != dbName) {
      return false
    }
    const schema = _schema ?? defaultSchema
    return map.has(schema) && map.get(schema).has(table)
  }
}

module.exports = {
  buildTableHasColumnPredicate,
}
