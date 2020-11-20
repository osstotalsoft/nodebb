function applyOrMap(fn, objOrArray) {
  return Array.isArray(objOrArray)
    ? objOrArray.map(fn)
    : fn(objOrArray)
}

function splitTableAndAlias(table) {
  return table
    .split(/ as /i)
    .map((x) => x.trim().replace(/[[\]]/g, ''))
}

function applyOnInsertFilter(filter, queryBuilder) {
  const [table] = splitTableAndAlias(queryBuilder._single.table)
  const { onInsert } = filter(table)
  if (!onInsert) {
    return
  }
  applyOrMap(
    (inserted) => onInsert(inserted, queryBuilder),
    queryBuilder._single.insert,
  )
}

function applyOnSelectFilter(filter, queryBuilder) {
  let tables = queryBuilder._statements
    .filter((st) => st.joinType !== undefined)
    .map((st) => st.table)
  tables.push(queryBuilder._single.table)
  tables.map(splitTableAndAlias).forEach(([table, alias]) => {
    const { onSelect } = filter(table)
    if (!onSelect) {
      return
    }
    onSelect(alias ?? table, queryBuilder)
  })
}

function applyOnUpdateFilter(filter, queryBuilder) {
  const [table, alias] = splitTableAndAlias(
    queryBuilder._single.table,
  )
  const { onUpdate } = filter(table)
  if (!onUpdate) {
    return
  }
  onUpdate(alias ?? table, queryBuilder._single.update, queryBuilder)
}

function applyOnDeleteFilter(filter, queryBuilder) {
  const [table, alias] = splitTableAndAlias(
    queryBuilder._single.table,
  )
  const { onDelete } = filter(table)
  if (!onDelete) {
    return
  }
  onDelete(alias ?? table, queryBuilder)
}

function applyFilter(filter, queryBuilder) {
  switch (queryBuilder._method) {
    case 'insert':
      applyOnInsertFilter(filter, queryBuilder)
      break
    case 'select':
      applyOnSelectFilter(filter, queryBuilder)
      break
    case 'update':
      applyOnUpdateFilter(filter, queryBuilder)
      break
    case 'del':
      applyOnDeleteFilter(filter, queryBuilder)
      break
  }
}

module.exports = {
  applyFilter,
}
