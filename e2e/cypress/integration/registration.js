/// <reference types="cypress" />
/* eslint-disable */

describe('Travel Plans', () => {
  it('visits app', () => {
    cy.visit('http://localhost:3000');

    cy.contains('Register').click();

    cy.url().should('include', 'register');

    const subdomain = Math.random().toString().replace('0.', '');
    const email = `${subdomain}@doe.com`;
    const username = `${subdomain} Doe`;
    const password = '12345678A!';

    cy.get('input[type="text"]').type(username).should('have.value', username);
    cy.get('input[type="email"]').type(email).should('have.value', email);
    cy.get('input[type="password"]')
      .eq(0)
      .type(password)
      .should('have.value', password);
    cy.get('input[type="password"]')
      .eq(1)
      .type(password)
      .should('have.value', password);

    cy.get('button[type="submit"').click();

    cy.wait('Trips');
  });
});
