export const log = function log (msg: string): void {
  console.log(`[SPAX] ${msg}`)
}

export const warn = function warn (msg: string): void {
  console.error(`[SPAX warn] ${msg}`)
}

export const error = function error (msg: string): void {
  throw new Error(`[SPAX error] ${msg}`)
}
