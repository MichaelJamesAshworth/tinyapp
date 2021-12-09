const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set('view engine', 'ejs');

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
characters.length));
  }
  return result;
};

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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  userIDFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userIDFromCookies, urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  userIDFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userIDFromCookies, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  userIDFromCookies = userDatabase[req.cookies["user_id"]];
  const templateVars = { userIDFromCookies, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Cookie login
app.post('/login', (req, res) => {
  res.cookie("username", req.body.username)
  console.log(req.body.username);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

app.post('/urls/:id', (req, res) => {
  //Access the new long url we're editing to
  let shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  //replace old long url with the new long url
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
})
//deletes URL resource
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${shortURL}`);
});

//responsible for getting register page
app.get('/register', (req, res) => {
  userIDFromCookies = userDatabase[req.cookies["user_id"]]
  const templateVars = { userIDFromCookies, urls: urlDatabase };
  res.render('register', templateVars)
});

app.post('/register', (req, res) => {
  //extract the user info from the incoming form => req.body
  const email = req.body.email;
  const password = req.body.password;
  //create a new user id => call our pre existing function
  let userID = generateRandomString()
  //add id, email, password to ours userdatabase => create a new user
  const newUser = {
      id: userID, 
      email, 
      password
    }
  // add the new user to the db
  userDatabase[userID] = newUser;
  //set the cookie => keep the userID in the cookie
  res.cookie('user_id', userID);
  console.log(userDatabase);
  console.log(userID);
  //redirect to '/urls'
  res.redirect('/urls');
});

//lookup user object using the user_id cookie value

for (let userID in userDatabase) {
  const user = userDatabase[userID]; //retrieve the value

}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

userDatabase.userID.email