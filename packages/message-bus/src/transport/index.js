// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { connect, disconnect, publish, subscribe } = require("./nats")
module.exports = {
    connect,
    disconnect,
    publish,
    subscribe
}