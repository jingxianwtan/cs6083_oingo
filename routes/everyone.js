const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const auth = require('../config/auth');

/* GET everyone index */
router.get('/', auth.isUser, function(req, res) {
  const user = res.locals.user;

  const queryStr = `select user_id, username from users where user_id != ${user.user_id};`;
  mysql_conn.query(queryStr, function (err, rows) {
    if (err) {
      console.log(err);
      res.render('everyone', {
        errors: [{ param: `Server Error`, msg: `Internal server error on DB query`, value: '' }],
        title: 'Everyone'
      });
    } else {
      res.render('everyone', {
        title: 'Everyone',
        users: rows
      });
    }
  });
});

// Exports
module.exports = router;
