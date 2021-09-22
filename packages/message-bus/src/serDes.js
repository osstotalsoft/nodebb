// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const humps = require('humps')

const contentType = 'application/json;charset=utf-8'

function serialize(msg) {
  const data = JSON.stringify(msg)
  return data
}

function deSerialize(data) {
  const msg = JSON.parse(data)
  const payload = msg.payload || humps.camelizeKeys(msg.Payload)
  const headers = msg.headers || msg.Headers
  const result = {
    payload,
    headers,
  }
  return result
}

function deSerializePayload(payload) {
  const p = humps.camelizeKeys(JSON.parse(payload))
  return p
}

function getInfo() {
  return {
    contentType,
  }
}

module.exports = {
  serialize,
  deSerialize,
  deSerializePayload,
  getInfo,
}
