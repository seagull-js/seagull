import { expect } from 'chai'
import { Given, Then } from 'cucumber'

Given('I am on the cucumber.js GitHub repository', function() {
  // this.browser.visit('https://google.de')
  // tslint:disable-next-line:no-unused-expression
  expect(!!this.browser.visit).to.be.true
})

Then('I should see a Usage section', () => {
  return true
})
