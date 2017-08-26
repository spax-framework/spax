import { createAction, handleAction } from 'vuex-actions'

export default ({ lang, translations }) => {
  const SET_I18N = 'SET_I18N'

  const state = { lang, translations }

  const getters = {
    lang: state => state.lang,
    translations: state => state.translations
  }

  const actions = {
    setI18n: createAction(SET_I18N)
  }

  const mutations = {
    [SET_I18N]: handleAction((state, mutation) => {
      Object.assign(state, mutation)
    })
  }

  return {
    state,
    getters,
    actions,
    mutations
  }
}
