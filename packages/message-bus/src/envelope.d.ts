export interface Context {
  correlationId?: any
  tenantId?: any
  [propName: string]: any
}

export interface Headers {
  [propName: string]: any
}

export interface Envelope<T> {
  payload: T
  headers: Headers
}

export type EnvelopeCustomizer = (headers: Headers) => Headers

export let envelope: {
  <T>(
    payload: T,
    ctx?: Context,
    envelopeCustomizer?: EnvelopeCustomizer,
  ): Envelope<T>
  headers: Headers
  getCorrelationId: (msg: Envelope<any>) => any
  getTenantId: (msg: Envelope<any>) => any
  getSource: (msg: Envelope<any>) => any
}
