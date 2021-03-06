<style src="todomvc-app-css/index.css"></style>

<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <h1>{{ __('todos') }}</h1>
      <input class="new-todo"
        autofocus
        autocomplete="off"
        :placeholder="__('What needs to be done?')"
        @keyup.enter="_addTodo">
    </header>
    <!-- main section -->
    <section class="main" v-show="todos.length">
      <input class="toggle-all" id="toggle-all"
        type="checkbox"
        :checked="allChecked"
        @change="toggleAll({ done: !allChecked })">
      <label for="toggle-all"></label>
      <ul class="todo-list">
        <todo-item v-for="(todo, index) in filteredTodos" :key="index" :todo="todo"></todo-item>
      </ul>
    </section>
    <!-- footer -->
    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ remaining | pluralize('item') | __($scope) }} {{ __('left') }}
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters">
          <a :href="'#/' + key"
            :class="{ selected: visibility === key }"
            @click="visibility = key">{{ key | capitalize | __($scope) }}</a>
        </li>
      </ul>
      <button class="clear-completed"
        v-show="todos.length > remaining"
        @click="clearCompleted">
        {{ __('Clear completed') }}
      </button>
    </footer>
  </section>
</template>

<script>
import TodoItem from '../components/todo-item'

const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}

export default {
  components: { TodoItem },
  data () {
    return {
      visibility: 'all',
      filters
    }
  },
  created () {
    this.visibility = this.params.filter || this.visibility
  },
  computed: {
    allChecked () {
      return this.todos.every(todo => todo.done)
    },
    filteredTodos () {
      return filters[this.visibility](this.todos)
    },
    remaining () {
      return this.todos.filter(todo => !todo.done).length
    }
  },
  mapState: [
    'todos',
    'route/params'
  ],
  // mapGetters: [
  //   'allChecked',
  //   'filteredTodos',
  //   'remaining'
  // ],
  mapActions: [
    'addTodo',
    'toggleAll',
    'clearCompleted'
  ],
  methods: {
    _addTodo (e) {
      const text = e.target.value.trim()
      if (text) {
        this.addTodo({ text })
      }
      e.target.value = ''
    }
  },
  filters: {
    pluralize: (n, w) => n === 1 ? w : (w + 's'),
    capitalize: s => s.charAt(0).toUpperCase() + s.slice(1)
  }
}
</script>
