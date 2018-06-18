<template>
  <div class="hello">
    Title: {{ post.title }}
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'HelloWorld',

  data() {
    return {
      post: {}
    }
  },

  async created() {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1') 
    this.post = response.data
  }
}
</script>

<style scoped>
</style>

