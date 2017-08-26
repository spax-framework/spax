<template>
  <transition name="fade" mode="out-in" appear>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </transition>
</template>

<style src="../styles/app.css"></style>
