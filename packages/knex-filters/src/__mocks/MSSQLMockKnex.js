// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

/* eslint-disable node/no-unpublished-require */
const Promise = require('bluebird')
const _ = require('lodash')

const { spec } = require('mock-knex/dist/platforms/knex/0.11')
const { makeClient } = require('mock-knex/dist/platforms/knex/0.8')

class MockTransaction {
  async begin() {
    return this
  }
  async commit() {}
  async request() {}
  async rollback() {}
}

const connection = {
  __knexUid: 'mockedConnection',
  timeout: Promise.method(getConnection),
  transaction: () => new MockTransaction(),
}
function getConnection() {
  return { ...connection }
}
const newSpec = _.defaultsDeep(
  {
    replace: [
      {
        client: {
          acquireConnection() {
            return Promise.resolve(getConnection())
          },
          destroyRawConnection() {},
        },
      },
    ],
  },
  spec,
)

const client = makeClient(newSpec)

module.exports = {
    newSpec,
    client
}
