// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.server()
    cy.route('https://jsonplaceholder.typicode.com/posts/1', {
      title: 'This is a stubbed title'
    })

    cy.visit('/')
    cy.contains('div', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })
})
