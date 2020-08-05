const { v4 } = require('uuid')

const correlationId = 'nbb-correlationId'
const source = 'nbb-source'
const tenantId = 'nbb-tenantId'

const headers = {
  correlationId,
  source,
  tenantId,
}

function envelope(payload, ctx = null, envelopeCustomizer = null) {
  const messagingSource = process.env.Messaging__Source || ''
  const correlationId = (ctx && ctx.correlationId) || v4()
  const tenantId = ctx && ctx.tenantId

  const platformHeaders = {
    [headers.correlationId]: correlationId,
    [headers.tenantId]: tenantId,
    [headers.source]: messagingSource,
  }

  const envelope = {
    payload,
    headers: envelopeCustomizer
      ? envelopeCustomizer(platformHeaders)
      : platformHeaders,
  }

  return envelope
}

envelope.headers = headers

envelope.getCorrelationId = function getCorrelationId(msg) {
  return msg.headers[headers.correlationId]
}

envelope.getTenantId = function getTenantId(msg) {
  return msg.headers[headers.tenantId]
}

envelope.getSource = function getSource(msg) {
  return msg.headers[headers.source]
}

module.exports = { envelope }
