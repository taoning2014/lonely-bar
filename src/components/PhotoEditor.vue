<template>
  <div class="app">
    <header class="header">
      <span class="title">Photo Editor</span>
      <NavBar client:only="vue" :data="data" @change="change" />
    </header>
    <main class="main">
    </main>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';

export default {
  components: {
    NavBar,
  },
  data() {
    return {
      data: {
        cropped: false,
        cropping: false,
        loaded: false,
        name: '',
        previousUrl: '',
        type: '',
        url: '',
      },
    };
  },

  methods: {
    change(action) {
      console.log('It works', action);
    },
  },
};
</script>



<style scoped>
.app {
  bottom: 0;
  left: 0;
  position: absolute;
  top: 0;
  right: 0;
}

.header {
  background-color: #666;
  height: 3rem;
  overflow: hidden;
  padding-left: 1rem;
  padding-right: 1rem;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .header {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.title {
  color: #fff;
  display: block;
  float: left;
  font-size: 1.125rem;
  line-height: 3rem;
}

.main {
  background-color: #333;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 3rem;
}
</style>
