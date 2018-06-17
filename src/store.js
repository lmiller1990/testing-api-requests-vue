import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export const actions = {
  async getPost(store) {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1') 

    store.commit('SET_POST', { userId: response.data.userId })
  }
}

export default new Vuex.Store({
  state: {

  },
  mutations: {

  },
  actions: actions
})
