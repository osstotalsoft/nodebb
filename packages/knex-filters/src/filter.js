const { applyFilter } = require('./queryBuilder')

//filter:: table -> {onSelect, onInsert, onUpdate}
function createFilter(tablePredicate, hooks) {
  return (table) => {
    return tablePredicate(table) ? hooks : {}
  }
}

function registerFilter(filter, knex) {
  const innerRunner = knex.client.runner
  knex.client.runner = (builder) => {
    applyFilter(filter, builder)
    return innerRunner.call(knex.client, builder)
  }
}

module.exports = {
  createFilter,
  registerFilter,
}
