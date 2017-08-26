import { createAction, handleAction } from 'vuex-actions'

export default ({ routes }, { scope }) => {
  const ADD_TODO = 'ADD_TODO'
  const DELETE_TODO = 'DELETE_TODO'
  const TOGGLE_TODO = 'TOGGLE_TODO'
  const EDIT_TODO = 'EDIT_TODO'
  const TOGGLE_ALL = 'TOGGLE_ALL'
  const CLEAR_COMPLETED = 'CLEAR_COMPLETED'

  const state = {
    todos: []
  }

  const getters = {
    allChecked (state) {
      return state.todos.every(todo => todo.done)
    },
    // filteredTodos (state) {
    //   return filters[state.visibility](state.todos)
    // },
    remaining (state) {
      return state.todos.filter(todo => !todo.done).length
    }
  }

  const actions = {
    addTodo: createAction(ADD_TODO),
    deleteTodo: createAction(DELETE_TODO),
    toggleTodo: createAction(TOGGLE_TODO),
    editTodo: createAction(EDIT_TODO),
    toggleAll: createAction(TOGGLE_ALL),
    clearCompleted: createAction(CLEAR_COMPLETED)
  }

  const mutations = {
    [ADD_TODO]: handleAction((state, { text }) => {
      state.todos.push({
        text,
        done: false
      })
    }),

    [DELETE_TODO]: handleAction((state, { todo }) => {
      state.todos.splice(state.todos.indexOf(todo), 1)
    }),

    [TOGGLE_TODO]: handleAction((state, { todo }) => {
      todo.done = !todo.done
    }),

    [EDIT_TODO]: handleAction((state, { todo, value }) => {
      todo.text = value
    }),

    [TOGGLE_ALL]: handleAction((state, { done }) => {
      state.todos.forEach(todo => (todo.done = done))
    }),

    [CLEAR_COMPLETED]: handleAction((state, { done }) => {
      state.todos = state.todos.filter(todo => !todo.done)
    })
  }

  return {
    state,
    getters,
    actions,
    mutations
  }
}
