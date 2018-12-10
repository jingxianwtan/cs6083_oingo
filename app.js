const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const messages = require('express-messages');
const passport = require('passport');
const MySqlStore = require('express-mysql-session')(session);

const mysql_conn = require('./models/MySqlConn');

// Initiate the app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public'))); // So that all the css in public folder can be applied.

// Set global errors variable
app.locals.errors = null;

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// Express session middleware
const sessionStore = new MySqlStore({}, mysql_conn);
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: true, // need to be True for the success message to appear during operation
  saveUninitialized: true
  // cookie: {secure: true} // need to comment this line out for the success message to appear during operation
}));

// Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Express messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global variables?
app.get('*', function(req, res, next) {
  res.locals.user = req.user || null; // if the user is logged in I'll have that user,  or it'll be null.
  next();
});

// Set routes
const index = require('./routes/index.js');
const users = require('./routes/users.js');
const notes = require('./routes/notes.js');
const myNotes = require('./routes/my_notes.js');
const friends = require('./routes/friends');
const everyone = require('./routes/everyone');
const myStates = require('./routes/my_states');

app.use('/', index);
app.use('/users', users);
app.use('/notes', notes);
app.use('/my_notes', myNotes);
app.use('/friends', friends);
app.use('/everyone', everyone);
app.use('/my_states', myStates);

// Start the server
const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, function() {
  console.log('Server started on port ' + port);
});


