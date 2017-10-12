export const log = function log (msg: string) {
  console.log(`[SPAX] ${msg}`)
}

export const warn = function warn (msg: string) {
  console.error(`[SPAX warn] ${msg}`)
}

export const error = function error (msg: string) {
  throw new Error(`[SPAX error] ${msg}`)
}
