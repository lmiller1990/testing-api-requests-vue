Testing API calls with Vuex and Axios

Almost all single page applications will make many calls to external services. I will discuss how to test API calls, specifically:

- Unit testing Vuex actions that use axios
- End to end (e2e) testing using Cypress

We will start at the bottom of the [test pyramid](https://martinfowler.com/bliki/TestPyramid.html) with some unit tests, and finish up with some e2e tests.

### Setup

Install the `vue-cli` with `npm install -g @vue/cli`, and then run `vue create api-tests`. Select "Manually select features" and choose the following:

- Babel
- Vuex
- Unit Testing
- E2E Testing 

For unit testing, we want `jest`, and for e2e select `cypress`. After the installation finishes, `cd api-tests` and install Axios with `npm install axios`.

### Unit Testing Axios with Jest

We will be using `jsonplaceholder`, a service which simulates a REST api. The endpoint is `https://jsonplaceholder.typicode.com/posts/1` and the response looks like this:

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

We will be doing TDD: write the test, watch it fails, and then make it pass. 

We will see how to mock `axios` in two situations:

1. A Vuex action, which makes an API call and commits the result
2. An e2e test, which displays the result in a UI

Let's start with the action test. Create the test file by running `touch tests/unit/actions.spec.js`. Before writing any code, run the test and watch it fail with `npm run test:unit`:

You should get:

```
FAIL  tests/unit/actions.spec.js
● Test suite failed to run

  Your test suite must contain at least one test.
```

Let's add a test. In `actions.spec.js` add the following:

```js
import { actions } from '../../src/store'

jest.mock('axios', () => {
  return {
    get: () => ({ data: { userId: 1 }})
  }
})


describe('getPost', () => {
  it('makes a request and commits the response', async () => {
    const store = { commit: jest.fn() }

    await actions.getPost(store)

    expect(store.commit).toHaveBeenCalledWith('SET_POST', { userId: 1 })
  }) 
})
```

Running this with `npm run test:unit` yields:

```
FAIL  tests/unit/actions.spec.js
  ● getPost › makes a request and commits the response

  ReferenceError: actions is not defined
```

As expected, the tests fails. We haven't even created `getPost` yet, so let's do so in `src/store.js`. We will also export it seperately to the `default export new Vuex.Store`:

```js
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
```

Now we can `import { actions }` in the spec:

```js
import { actions } from '../../src/store'

jest.mock('axios', () => {
  return {
    get: () => ({ data: { userId: 1 }})
  }
})


describe('getPost', () => {
  it('makes a request and commits the response', async () => {
    const store = { commit: jest.fn() }

    await actions.getPost(store)

    expect(store.commit).toHaveBeenCalledWith('SET_POST', { userId: 1 })
  }) 
})
```

This gives us a new error:

```
FAIL  tests/unit/actions.spec.js
  ● getPost › makes a request and commits the response

  ReferenceError: store is not defined

     5 |     actions.getPost()
     6 |
  >  7 |     expect(store.commit).toHaveBeenCalledWith('SET_POST', { userId: 1 })
```

`store` is not defined. The goal of this test is simply to make the API call, and commit whatever response comes back, so we will we mock `store.commit`, and use Jest's `.toHaveBeenCalledWith` matcher to make sure the response was committed with the correct `mutation` handler. We pass `store` as the first argument to `getPost`, to simulate how `Vuex` passes a reference to the `store` as the first argument to all actions. Update the test:

```js
import { actions } from '../../src/store'

jest.mock('axios', () => {
  return {
    get: () => ({ data: { userId: 1 }})
  }
})


describe('getPost', () => {
  it('makes a request and commits the response', async () => {
    const store = { commit: jest.fn() }

    await actions.getPost(store)

    expect(store.commit).toHaveBeenCalledWith('SET_POST', { userId: 1 })
  }) 
})
```

`jest.fn` is just a mock function - it doesn't actually do anything, but records useful data like how many times it was called, and with what arguments. The test now fails with different error:

```
FAIL  tests/unit/actions.spec.js
  ● getPost › makes a request and commits the response

  expect(jest.fn()).toHaveBeenCalledWith(expected)

  Expected mock function to have been called with:
    ["SET_POST", {"userId": 1}]
  But it was not called.
```

This is what we want. The test is failing for the right reason - a `SET_POST` mutation should have been committed, but was not. Update `store.js` to actually make the API call:

```js
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
```

Note we added `async` to the function, we we can use `await` on the axios API call. The test still fails with same error - we also need to prepend the action call in the test with `await`:

```js
import { actions } from '../../src/store'

jest.mock('axios', () => {
  return {
    get: () => ({ data: { userId: 1 }})
  }
})


describe('getPost', () => {
  it('makes a request and commits the response', async () => {
    const store = { commit: jest.fn() }

    await actions.getPost(store)

    expect(store.commit).toHaveBeenCalledWith('SET_POST', { userId: 1 })
  }) 
})
```

Now we have two passing tests, including the default `HelloWorld` spec included in the project:

```
PASS  tests/unit/actions.spec.js
PASS  tests/unit/HelloWorld.spec.js

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.333s, estimated 2s
Ran all test suites.
```

This is not ideal, though - we are hitting a real network, which makes the unit test slow and prone to failure. Luckily, Jest let's us mock dependencies, like `axios`, in a number of ways. Let's see how to do so with `jest.mock`.


### Mocking Axios in the Action spec

Jest provides no less that __four__ different ways to mock classes and modules, In large projects, I use [manual mocks](https://facebook.github.io/jest/docs/en/manual-mocks.html#mocking-user-modules) by creating a `__mocks__` folder on the same level as `node_modules` and exporting a mock axios module, however for the simple example I will use an [ES6 class mock](https://facebook.github.io/jest/docs/en/es6-class-mocks.html#calling-jestmock-jest-docs-en-jest-objecthtml-jestmockmodulename-factory-options-with-the-module-factory-parameter). I think both are fine, and have been tending towards this style as of late. 

To mock `axios` using an ES6 class mock, all you need to do is call `jest.mock('axios')` and return a function with the desired implentation (since ES6 classes are really just functions under the hood). In this case, we want a `get` function that returns a `userId: 1` object. Update `actions.spec.js`:

```js
// ...

jest.mock('axios', () => {
  return {
    get: () => ({ data: { userId: 1 }})
  }
})

// ...
```

Easy. The test still passes, but now we are using a mock axios instead of a real network call. We should watch the test fail again, though, just to be should, so update the mock to return `{ userId: 2 }` instead:

```
 FAIL  tests/unit/actions.spec.js
  ● getPost › makes a request and commits the response

expect(jest.fn()).toHaveBeenCalledWith(expected)

Expected mock function to have been called with:
  {"userId": 1}
as argument 2, but it was called with
  {"userId": 2}.
```

Looks good - the test is failing for the right reason. Revert the test, and let's move on to writing an e2e test.

### Stubbing Axios in a component lifecycle

Now we know how to test an action uses `axios` - how about in a component? In preparation for writing an e2e using Cypress, let's see an example of a component that makes an API call in its `created` hook.

Open `src/components/HelloWorld.vue`, and delete all the existing markup - you should be left with this:

```vue
<template>
  <div class="hello"></div>
</template>

<script>
export default {
  name: 'HelloWorld'
}
</script>

<style scoped>
</style>
```

We want to `import axios`, and make an API request. The code will be similar to the code in `getPost`. Lastly, we will render the `title` of the post.

```vue
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
```

Run the application with `npm run serve`. Visiting `localhost:8080` should show the post title on the screen:

```
Title: sunt aut facere repellat provident occaecati excepturi optio reprehenderit
```

Let's update the default test `vue-cli` gave us in `tests/e2e/specs/test.js`:

```js
// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.server()
    cy.route('https://jsonplaceholder.typicode.com/posts/1', {
      title: 'This is a stubbed title'
    })

    cy.visit('/')
    cy.contains('div', 'This is a stubbed title')
  })
})
```

Run the test with `npm run e2e`. Cypress has a great interface and is really easy to use. You should see:

SS: cypress-ui

Click 'run'. A Chrome browser should open and if everything went well, you should see:

SS: e2e-passing

It works! However, this test suffers from the original problem we had in the unit test we wrote - it is using a real network call. We want to __stub__ the network call, with a fake one, so we can consistently reproduce the same results without relying on a potentially flakey external API. To stub a response in Cypress, you need to do [two things](https://docs.cypress.io/guides/guides/network-requests.html#Stubbing):

1. Start a `cy.server`
2. Provide a `cy.route`

`cy.route` takes [several forms](https://docs.cypress.io/api/commands/route.html#Arguments). The one we will use is 

> cy.route(url, response)

Update the test to use a stubbed response:

```js
// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.server()
    cy.route('https://jsonplaceholder.typicode.com/posts/1', {
      title: 'This is a stubbed title'
    })

    cy.visit('/')
    cy.contains('div', 'This is a stubbed title')
  })
})
```

If you still have the Cypress server running, saving should automatically rerun the specs. Now we have a failure:

SS: e2e-updated

We can see on the right hand side that the stubbed response was rendered! Simply update the spec to assert the stubbed title is rendered and everything should be green again:

SS: e2e-final

### Conclusion and Improvements

We saw how to mock `axios` in a Vuex action spec, and how to stub the response using Cypress. With the advent of tools like Jest and Cypress, testing is extremely simple and actually makes development a lot more smooth one you are in the habit of writing tests. 

Some improvements can be made, an are left an exercise:

- Write some tests using Cypress against a real server, to test critical paths in your application, such as sign up and login. Not stubbing, but against a real server
- Mock `axios` using Jest's [manual mocks](https://facebook.github.io/jest/docs/en/manual-mocks.html), where you create a `__mocks__` folder with a mock implementation of `axios` for use in your unit tests
- Write a unit tests for `HelloWorld.vue` that mocks `axios` in the same way as `actions.spec.js`

The source code is available here.

