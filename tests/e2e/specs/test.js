// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('div', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })
})
