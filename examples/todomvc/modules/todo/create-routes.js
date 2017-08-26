export default () => {
  return [
    {
      path: '/:filter?',
      exact: true,
      // 异步
      component: () => import('./views/index')
      // 同步
      // component: require('./views/index')
    }
  ]
}
