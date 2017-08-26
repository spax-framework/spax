export const log = function log (msg) {
  console.log(`[SPAX] ${msg}`)
}

export const warn = function warn (msg) {
  console.error(`[SPAX warn] ${msg}`)
}

export const error = function error (msg) {
  throw new Error(`[SPAX error] ${msg}`)
}
