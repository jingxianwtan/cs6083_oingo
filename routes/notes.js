const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const auth = require('../config/auth');

/* GET notes index */
router.get('/', auth.isUser, function(req, res) {
  mysql_conn.query('select * from notes', function (err, rows) {
    if (err) console.log(err);

    res.render('notes', {
      title: 'Notes',
      notes: rows
    });
  });
});

/* GET add note */
router.get('/add-note', auth.isUser, function(req, res) {
  res.render('add_note', {
    title: 'Add Note'
  });
});

/* POST add note */
router.post('/add-note', function(req, res) {
  req.checkBody("text", "Note text cannot be empty").notEmpty();

  const text = req.body.text;
  const radius = req.body.radius;

  const user = req.user;

  const errors = req.validationErrors();

  if (errors) {
    res.render('add_note', {
      errors: errors,
      title: 'Add Note',
      user: user,
      text: text,
      radius: radius
    });
  } else {
    const queryStr = `insert into notes (user_id, text, lat, lon, timestamp, radius)
                      VALUES (${user.user_id},'${text}','lat','long','2018-11-19 12:00:00', ${radius});`;
    mysql_conn.query(queryStr, function(err) {
      if (err) console.log(err);

      req.flash('success', 'A new note has been added!');
      res.redirect('/notes');
    });
  }
});

// Exports
module.exports = router;
