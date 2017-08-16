export default function prom (val) {
  if (val && typeof val.then === 'function') {
    return val
  }

  return val ? Promise.resolve(val) : Promise.reject(val)
}
