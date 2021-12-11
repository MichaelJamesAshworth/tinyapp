

// Helper function that returns an object as the user
const searchForUserEmail = (email, userDatabase) => {
  for (let userID in userDatabase) {
    const user = userDatabase[userID];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

// Helper function that generates a random string. Use this to generate new user Id's
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
characters.length));
  }
  return result;
}

// Helper function that returns a object of filtered URLs based on the 
// userID that is currently logged in
const urlsForUser = (urlDatabase, id) => {
  let objectOfFilteredURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      objectOfFilteredURLs[key] = urlDatabase[key]
    }
  }
  return objectOfFilteredURLs;
};


module.exports = { searchForUserEmail, generateRandomString, urlsForUser }