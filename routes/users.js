const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const mysql_conn = require('../models/MySqlConn');

/* GET register */
router.get('/register', function(req, res) {
  res.render('register', {
    title: 'Register'
  });
});

/* POST register */
router.post('/register', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  req.checkBody('username', 'Name is required!').notEmpty();
  req.checkBody('password', 'Password is required!').notEmpty();
  req.checkBody('password2', 'Passwords do not equal!').equals(password);

  const errors = req.validationErrors();
  if (errors) {
    res.render('register', {
      errors: errors,
      user: null,
      title: 'Register'
    });
  } else {
    mysql_conn.query(`select * from users where username = '${username}'`, function (err, rows) {
      if (err) console.log(err);

      if (rows.length) {
        req.flash('danger', 'Username exists, choose another username!');
        res.redirect('/users/register');
      } else {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) console.log(err);

            mysql_conn.query(`insert into users (username, password) values ('${username}','${hash}');`, function(err) { // Query that inserts the user into table
              if (err) console.log(err);

              req.flash('success', 'You are now registered!');
              res.redirect('/users/login');
            });
          });
        });
      }
    });
  }
});

/* GET login */
router.get('/login', function(req, res) {
  if (res.locals.user) {
    res.redirect('/');
  } else {
    res.render('login', {
      title: 'Log in'
    });
  }
});

/* POST login */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

/* GET logout */
router.get('/logout', function(req, res) {
  req.logout();

  req.flash('success', 'You are logged out!');
  res.redirect('/users/login');
});

// Exports
module.exports = router;