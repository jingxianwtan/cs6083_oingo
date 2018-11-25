const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

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

            mysql_conn.query(`INSERT INTO users (username, password) VALUES ('${username}','${hash}');`, function(err) { // Query that inserts the user into table
              if (err) console.log(err);

              req.flash('success', 'You are now registered!');
              res.redirect('/');
            });
          });
        });
      }
    });
  }
});

// Exports
module.exports = router;