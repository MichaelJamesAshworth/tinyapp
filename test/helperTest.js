const { assert } = require('chai');

const { searchForUserEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('searchForUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = searchForUserEmail("user@example.com", testUsers);
    const expectedUserID = testUsers["userRandomID"];
    assert.equal(user, expectedUserID);
  });

  it('should return undefined with an email that does not currently exist within the database', function() {
    const user = searchForUserEmail("iDontExist@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});