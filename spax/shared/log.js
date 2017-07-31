import noop from './noop'

export const log = process.env.NODE_ENV === 'production' ? noop : function log (msg) {
  console.log(`[SPAX]: ${msg}`)
}

export const error = process.env.NODE_ENV === 'production' ? noop : function error (msg) {
  throw new Error(`[SPAX error]: ${msg}`)
}
