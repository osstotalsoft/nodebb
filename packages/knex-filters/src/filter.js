// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { applyFilter } = require('./queryBuilder')

//filter:: table -> {onSelect, onInsert, onUpdate}
function createFilter(tablePredicate, hooks) {
  return (table) => {
    return tablePredicate(table) ? hooks : {}
  }
}

function registerFilter(filter, knex) {
  function extendKnex(knex) {
    const innerRunner = knex.client.runner
    knex.client.runner = (builder) => {
      applyFilter(filter, builder)
      return innerRunner.call(knex.client, builder)
    }
  }

  extendKnex(knex)

  const innerTransaction = knex.client.transaction
  knex.client.transaction = function (container, config, outerTx) {
    const wrapper = function (trx) {
      extendKnex(trx)
      return container(trx)
    }
    return innerTransaction.call(
      knex.client,
      wrapper,
      config,
      outerTx,
    )
  }
}

module.exports = {
  createFilter,
  registerFilter,
}
