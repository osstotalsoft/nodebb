//filter:: table -> {onSelect, onInsert}
function createFilter(cond, filterDef) {
  const _when = (b, fn) => (...args) => {
    if (b) fn(...args)
  }
  return (table) => {
    const x = cond(table)
    return {
      onSelect: _when(x, filterDef.onSelect),
      onInsert: _when(x, filterDef.onInsert),
    }
  }
}

function applyFilter(filter, queryBuilder) {
  const applyInsertFilter = () => {
    const [ table ] = splitTableAndAlias(
      queryBuilder._single.table,
    )
    const { onInsert } = filter(table)
    applyOrMap(
      (inserted) => onInsert(inserted, queryBuilder),
      queryBuilder._single.insert,
    )
  }

  const applySelectFilter = () => {
    let tables = queryBuilder._statements
      .filter((st) => st.joinType !== undefined)
      .map((st) => st.table)
    tables.push(queryBuilder._single.table)
    tables
      .map(splitTableAndAlias)
      .forEach(([ table, alias ]) =>
        filter(table).onSelect(alias ?? table, queryBuilder),
      )
  }

  const applyOtherFilter = () => {
    const[ table, alias ] = splitTableAndAlias(
      queryBuilder._single.table,
    )

    filter(table).onSelect(alias ?? table, queryBuilder)
  }

  switch (queryBuilder._method) {
    case 'insert':
      applyInsertFilter()
      break
    case 'select':
      applySelectFilter()
      break
    default:
      applyOtherFilter()
  }
}

function registerFilter(filter, knex) {
  const innerRunner = knex.client.runner
  knex.client.runner = (builder) => {
    applyFilter(filter, builder)
    return innerRunner.call(knex.client, builder)
  }
}

function applyOrMap(fn, objOrArray) {
  return Array.isArray(objOrArray)
    ? objOrArray.map(fn)
    : fn(objOrArray)
}

function splitTableAndAlias(table) {
  return table.split(/ as /i).map((x) => x.trim().replace('[', '').replace(']', ''))
}

module.exports = {
  createFilter,
  applyFilter,
  registerFilter,
}
