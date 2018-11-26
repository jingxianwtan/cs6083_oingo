const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const auth = require('../config/auth');

/* GET friends index */
router.get('/', auth.isUser, function(req, res) {
  const user = res.locals.user;

  const queryStr = `select user_id, username from 
                    (select friend_id from friendships where user_id = ${user.user_id}) as friends
                    join users on friends.friend_id = users.user_id;`;
  mysql_conn.query(queryStr, function (err, rows) {
    if (err) console.log(err);

    res.render('friends', {
      title: 'Friends',
      friends: rows
    });
  });
});

/* GET add friend */
router.get('/add-friend/:id', auth.isUser, function(req, res) {
  const other_user_id = req.params.id;
  console.log(other_user_id);
  const user = res.locals.user;
  console.log(user);

  const queryStr2 = `insert into friendships values 
                    (${user.user_id}, ${other_user_id}), (${other_user_id}, ${user.user_id});`;

  mysql_conn.query(queryStr2, function (err) {
    if (err) console.log(err);
    res.redirect('/friends');
  });
});

/* GET unfriend */
router.get('/unfriend/:id', auth.isUser, function(req, res) {
  const friend_id = req.params.id;
  console.log(friend_id);
  const user = res.locals.user;
  console.log(user);

  const queryStr = `delete from friendships where 
                    (user_id = ${user.user_id} and friend_id = ${friend_id})
                    or (friend_id = ${user.user_id} and user_id = ${friend_id});`;
  mysql_conn.query(queryStr, function (err) {
    if (err) console.log(err);

    res.redirect('/friends');
  });
});

// Exports
module.exports = router;
