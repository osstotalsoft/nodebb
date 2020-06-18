const humps = require("humps");

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
        headers
    }
    return result
}

module.exports = {
    serialize,
    deSerialize
}