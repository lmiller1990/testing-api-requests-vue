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

1. An action, which makes an API call
2. A component which makes an API call in it's `created` hook 

Let's start with the action test. Create the test file by running `touch tests/unit/actions.spec.js`. Before writing any code, run the test and watch it fail with `npm run test:unit`:

You should get:

FAIL  tests/unit/actions.spec.js
  ● Test suite failed to run

    Your test suite must contain at least one test.

Let's add a test. In `actions.spec.js` add the following:

//# master:tests/unit/actions.spec.js?fdcb19ae88889c8a7d3ee94ec9de26cc1feba54c

Running this with `npm run test:unit` yields:

FAIL  tests/unit/actions.spec.js
  ● getPost › makes a request and commits the response

    ReferenceError: actions is not defined

As expected, the tests fails. We haven't even created `getPost` yet, so let's do so in `src/store.js`. We will also export it seperately to the `default export new Vuex.Store`:


