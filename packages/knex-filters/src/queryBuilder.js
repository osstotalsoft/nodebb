// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

function applyOrMap(fn, objOrArray) {
  return Array.isArray(objOrArray)
    ? objOrArray.map(fn)
    : fn(objOrArray)
}

function splitTableAndAlias(table) {
  if (typeof table != 'string') {
    return [null, null]
  }
  return table
    .split(/ as /i)
    .map((x) => x.trim().replace(/[[\]]/g, ''))
}

function isFunction(f) {
  return typeof f === 'function'
}

function applyOnInsertFilter(filter, queryBuilder) {
  const [table, alias] = splitTableAndAlias(
    queryBuilder._single.table,
  )
  const { onInsert } = filter(table)
  if (!onInsert) {
    return
  }
  applyOrMap(
    (inserted) => onInsert(table, alias, queryBuilder, inserted),
    queryBuilder._single.insert,
  )
}

function applyOnSelectFilter(filter, queryBuilder) {
  const fromClause = queryBuilder._single
  const joinClauses = queryBuilder._statements.filter(
    (st) => st.joinType !== undefined,
  )
  const clauses = [fromClause, ...joinClauses]

  const joinType2HookMapping = {
    inner: 'innerJoin',
    left: 'leftJoin',
    'left outer': 'leftJoin',
    right: 'rightJoin',
    'right outer': 'rightJoin',
    full: 'fullOuterJoin',
    'full outer': 'fullOuterJoin',
    cross: 'crossJoin',
  }

  clauses.forEach((clause) => {
    const [table, alias] = splitTableAndAlias(clause.table)
    const { onSelect } = filter(table)

    if (!onSelect) {
      return
    }

    const hook = isFunction(onSelect)
      ? onSelect
      : onSelect[
          clause.joinType
            ? joinType2HookMapping[clause.joinType]
            : 'from'
        ]
    if (hook && isFunction(hook)) {
      hook(table, alias, queryBuilder, clause)
    }
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
  onUpdate(table, alias, queryBuilder, queryBuilder._single.update)
}

function applyOnDeleteFilter(filter, queryBuilder) {
  const [table, alias] = splitTableAndAlias(
    queryBuilder._single.table,
  )
  const { onDelete } = filter(table)
  if (!onDelete) {
    return
  }
  onDelete(table, alias, queryBuilder)
}

function applyFilter(filter, queryBuilder) {
  if (!queryBuilder?._method) return
  switch (queryBuilder._method) {
    case 'insert':
      applyOnInsertFilter(filter, queryBuilder)
      break
    case 'update':
      applyOnUpdateFilter(filter, queryBuilder)
      break
    case 'del':
      applyOnDeleteFilter(filter, queryBuilder)
      break
    default:
      applyOnSelectFilter(filter, queryBuilder)
  }
}

module.exports = {
  applyFilter,
}
