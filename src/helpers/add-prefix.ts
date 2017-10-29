/**
 * 将路由转成带前缀的绝对路由
 */
export default function addPrefixToPath (prefixes: string[], path: string): string {
  // 首字母为 `/`，则只取根 prefix
  const prefix: string = path.charAt(0) === '/' ? prefixes[0] : prefixes.join('/')
  return `/${prefix}/${path}`.replace(/\/+$/, '').replace(/\/\/+/g, '/') || '/'
}
