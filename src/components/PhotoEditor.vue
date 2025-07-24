<template>
  <div class="app">
    <header class="header">
      <span class="title">Photo Editor</span>
      <NavBar client:only="vue" :data="data" @change="change" />
    </header>
    <main class="main">
      <Editor client:only="vue" v-if="data.loaded" ref="editor" :data="data" />
      <Loader client:only="vue" v-else ref="loader" :data="data" />
    </main>
  </div>
</template>

<script lang="ts">
import NavBar from './NavBar.vue';
import Loader from './Loader.vue';
import Editor from './Editor.vue';
import type { ImageData, DataAction } from '../types/index';

export default {
  components: {
    NavBar,
    Loader,
    Editor,
  },

  data(): { data: ImageData } {
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
    change(action: DataAction) {
      const editor = this.$refs.editor as typeof Editor;
      if (!editor) {
        return;
      }

      switch (action) {
        case 'crop':
          editor.crop();
          break;

        case 'clear':
          editor.clear();
          break;

        case 'restore':
          editor.restore();
          break;

        case 'remove':
          editor.reset();
          break;

        default:
          ((e: never) => { throw new Error(e) })(action);
      }
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
