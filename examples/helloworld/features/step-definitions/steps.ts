import { expect } from 'chai'
import { Given, Then } from 'cucumber'

Given('I am on the cucumber.js GitHub repository', function(done) {
  this.browser.visit('http://localhost:8080/',done)
})

Then('I should see a Usage section', function() {
  expect(this.browser.html()).to.contain('hello html world')
  return true
})
