const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {searchForUserEmail, generateRandomString, urlsForUser  } = require('./helper');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  maxAge: 24 * 60 * 60 * 1000 
}))

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

app.get("/", (req, res) => {
  let userFromCookies = userDatabase[req.session.user_id];
  if (!userFromCookies) {
    return res.redirect('/login');
  } 
  return res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
let userFromCookies = userDatabase[req.session.user_id];
  if (!userFromCookies) {
    return res.send("It looks like you need to login in order to use this feature");
  }
  const urls = urlsForUser(urlDatabase, userFromCookies.id)
  const templateVars = { userFromCookies, urls };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  //if user isn't logged in, redirect them to /login
  let userFromCookies = userDatabase[req.session.user_id];
   if (!userFromCookies) {
     return res.redirect('/login');
   }
  const templateVars = { userFromCookies, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userFromCookies = userDatabase[req.session.user_id];
   if (!userFromCookies) {
     return res.send("It looks like you need to login in order to use this feature");
   }
   //if the user is logged in, but does not own the url
   if (userFromCookies.id !== urlDatabase[req.params.id].userID) {
    return res.send("Sorry! It looks like this URL doesn't belong to you");
   }
  const templateVars = { userFromCookies, id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});
  
app.get("/u/:id", (req, res) => {
  if(!urlDatabase[req.params.id]) {
    return res.send("Sorry! It looks like this URL doesn't exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//responsible for editing URLS
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  const userID = req.session.user_id
  urlsThatUserOwns = urlsForUser(urlDatabase, userID)
  //protect the endpoint from CLI users
  if (urlsThatUserOwns[shortURL]) {
  
  }
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID: userID
  };
  res.redirect('/urls');
});

//Responsible for deleting URLs
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  urlsThatUserOwns = urlsForUser(urlDatabase, userID);
  //Protecting from CLI users who dont have an account
  if (urlsThatUserOwns[shortURL]) {
    delete urlDatabase[req.params.id];
  } else {
    return res.send("It looks like you need to logi in order to use this feature")  
  }
  res.redirect('/urls');
});

//This form is responsible for creating new urls
app.post("/urls", (req, res) => {
  //protect the route by introducing conditional
  const userID = req.session.user_id
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
  let userFromCookies = userDatabase[req.session.user_id];
  if (userFromCookies) {
    res.redirect('/urls');
  }
  const templateVars = { userFromCookies, urls: urlDatabase };
  res.render('register', templateVars);
});

//responsible for handling the register page data
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password: hashedPassword
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
  console.log(userDatabase);
  req.session.user_id = userID;
  res.redirect('/urls');
});

//RESPONSIBLE FOR GETTING THE LOGIN PAGE
app.get('/login', (req, res) => {
  let userFromCookies = userDatabase[req.session.user_id];
  if (userFromCookies) {
    res.redirect('/urls');
  }
  const templateVars = { userFromCookies, urls: urlDatabase };
  res.render('login', templateVars);
});

// responsible for handling data from the login page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // active user is calling searchForUserEmail to determine the active user
  const user = searchForUserEmail(email, userDatabase);
  if (!user) {
    res.status(400).send(`It looks like this user does not exist`);
  }
  const hashedPassword = user.password

  // call email function ===> user user.password
  let authenticated = bcrypt.compareSync(password, hashedPassword); // returns true
  
  // user is authenticated ==> log the user
  if (user && authenticated) {
    // asking the browser to store the user id in the cookies
    req.session.user_id = user.id;
    return res.redirect('/urls');
  }
  res.status(403).send('Oops! It looks like you entererd the wrong login credentials!');
});

app.post('/logout', (req, res) => {
req.session = null
console.log(userDatabase);
res.redirect('/urls');
});

app.get('/*', (req, res) => {
  res.status(404).send("Page not found");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

userDatabase.userID.email;