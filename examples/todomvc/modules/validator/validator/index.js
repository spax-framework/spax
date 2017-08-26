import * as rules from './rules'

export default {
  install (Vue) {
    Vue.mixin({
      beforeCreate () {
        const options = this.$options
        const { validator, parent } = options

        function nextTick (auto) {
          this.$nextTick(() => {
            // 定义了校验规则
            if (this.validate) {
              this.$validation.fields.push(this)
              // 加载完成自动检查
              if (auto) {
                this.$validate().catch(e => e)
              }
            }
          })
        }

        if (validator) {
          // 在入口处定义 $validation
          Vue.util.defineReactive(this, '$validation', {
            fields: [],
            errors: []
          })
          this.$validationEntry = this
          nextTick.call(this, validator.auto)
        } else if (parent) {
          // 递归连接父级的 $validation
          const { $validation } = parent
          if ($validation) {
            const { $validationEntry } = parent
            this.$validation = $validation
            this.$validationEntry = $validationEntry
            nextTick.call(this, $validationEntry.$options.validator.auto)
          }
        }
      }
    })

    /**
     * $validate
     * validate vm recursively.
     *
     * @return {promise}
     */
    Vue.prototype.$validate = async function $validate (fromEntry) {
      const { validate, $validation = {}, $validationEntry } = this

      function updateValidation (replacement) {
        const field = this.field || this
        const { errors } = $validation
        const found = errors.some((error, index) => {
          if (error.field === field) {
            const params = [index, 1]
            if (replacement) {
              params.push(replacement)
            }
            errors.splice.apply(errors, params)
            return true
          }
          return false
        })

        if (!found && replacement) {
          errors.push(replacement)
        }

        return $validation
      }

      // 如果此处为校验入口
      if ($validationEntry === this && !fromEntry) {
        // 顶级往下校验所有子组件
        return Promise.all($validation.fields
          .map(field => field.$validate(true)))
          // 总是返回 $validation
          .then(() => $validation)
          .catch(() => Promise.reject($validation))
      } else {
        if (!validate) {
          return $validation
        }

        try {
          await Promise.all(Object.keys(validate).map(async key => {
            const { validator = rules[key], rule, message } = validate[key]

            function reject () {
              return Promise.reject({
                field: this.field || this,
                rule,
                message
              })
            }

            if (validator) {
              try {
                // reject if falsy
                if (!await validator(this.value, rule)) {
                  return reject.call(this)
                }
              } catch (e) {
                return reject.call(this)
              }
            } else {
              process.env.NODE_ENV === 'production' || console.warn(`'${key}' is NOT a valid validator`)
            }
          }))
          return Promise.resolve(updateValidation.call(this))
        } catch (e) {
          return Promise.reject(updateValidation.call(this, e))
        }
      }
    }
  }
}
