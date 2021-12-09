const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
characters.length));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

const userDatabase = {
  "userID": {
    id: "userID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "userID2": {
    id: "userID2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let userIDFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userIDFromCookies, urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let userIDFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userIDFromCookies, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userIDFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userIDFromCookies, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  res.cookie("user_id", req.body.username);
  console.log(req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${shortURL}`);
});

//responsible for getting register page
app.get('/register', (req, res) => {
  let userIDFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userIDFromCookies, urls: urlDatabase };
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
  console.log(userDatabase);
  console.log(userID);
  res.redirect('/urls');
});

const registerValidation = (email, password, userDatabase) => {

};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

userDatabase.userID.email;