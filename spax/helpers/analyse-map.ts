interface ValueMap  {
  scope: string
  value: string
  alias: string
}

/**
 * 解析 getter、actions、state，支持别名和模块名
 */
export default function analyseMap (value: string, scope: string): ValueMap {
  let alias: string = value

  /**
   * 解析 scope/value 格式
   *   'scope/value' -> ['scope', 'value']
   *   'scope/value as value1' -> ['scope', 'value as value1']
   */
  const scopeAndValue: string[] = value.split('/')
  if (scopeAndValue.length === 2) {
    scope = scopeAndValue[0]
    alias = value = scopeAndValue[1]
  }

  /**
   * 解析 as 别名
   *   'value as value1' -> ['value', 'value1']
   */
  const valueAndAlias: string[] = value.split(/\s+as\s+/)
  if (valueAndAlias.length === 2) {
    value = valueAndAlias[0]
    alias = valueAndAlias[1]
  }

  return { scope, value, alias }
}
