const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": {
      longURL: "https://www.tsn.ca",
      userID: "userID"
  },
  "9sm5xk": {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const userDatabase = {
  "userID": {
    id: "userID",
    email: "m@m.com",
    password: "test"
  },
  "userID2": {
    id: "userID2",
    email: "test@test.com",
    password: "test"
  }
};

// Helper function that generates a random string. Use this to generate new user Id's
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
characters.length));
  }
  return result;
}

// Helper function that looks for the email in the userDatabase
const searchForUserEmail = (email, userDatabase) => {
  for (let userID in userDatabase) {
    const user = userDatabase[userID];
    
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

//Helper function that determines if a user is authenticated or not
const authenticateUser = (email, password, userDatabase) => {
  const user = searchForUserEmail(email, userDatabase);
  if (user && user.password === password) {
    return user;
  }
  return false;
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
let userFromCookies = userDatabase[req.cookies["user_id"]];
  if (!userFromCookies) {
    return res.redirect('/login');
  }
  const urls = urlsForUser(urlDatabase, userFromCookies.id)
  const templateVars = { userFromCookies, urls };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  //if user isn't logged in, redirect them to /login
  let userFromCookies = userDatabase[req.cookies["user_id"]];
   if (!userFromCookies) {
     return res.redirect('/login');
   }
  const templateVars = { userFromCookies, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userFromCookies, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});
  
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//responsible for editing URLS
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  const userID = req.cookies.user_id
  urlsThatUserOwns = urlsForUser(urlDatabase, userID)
  //protect the endpoint from CLI users
  if (urlsThatUserOwns[shortURL]) {
    d
  }
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID: userID
  };
  res.redirect('/urls');
});

//Responsible for deleting URLs
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  urlsThatUserOwns = urlsForUser(urlDatabase, userID);
  //Protecting from CLI users who dont have an account
  if (urlsThatUserOwns[shortURL]) {
    delete urlDatabase[req.params.shortURL];
  } else {
    return res.send("It looks like you need to logi in order to use this feature")  
  }
  res.redirect('/urls');
});

//This form is responsible for creating new urls
app.post("/urls", (req, res) => {
  //protect the route by introducing conditional
  const userID = req.cookies.user_id
   if (!userID) {
     return res.send("It looks like you need to login in order to use this feature");
   }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID
  }
  res.redirect(`/urls/${shortURL}`);
});

//responsible for getting register page
app.get('/register', (req, res) => {
  let userFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userFromCookies, urls: urlDatabase };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password
  };

  for (let userID in userDatabase) {
    const user = userDatabase[userID];
    if (user.email === email) {
      res.status(400).send('Sorry, it looks like that user already exists!');
      return;
    } else if (email === '' || password === '') {
      res.status(400).send('Oops, it looks like you forgot to fill in a field. Please try again!');
      return;
    }
  }

  userDatabase[userID] = newUser;
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  let userFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userFromCookies, urls: urlDatabase };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password, userDatabase)
  // user is authenticated ==> log the user
  if (user) {
    // asking the browser to store the user id in the cookies
    res.cookie('user_id', user.id);
    return res.redirect('/urls');
  }
  res.status(403).send('Oops! It looks like you entererd the wrong login credentials!');
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

userDatabase.userID.email;