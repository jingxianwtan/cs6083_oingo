const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const Utils = require('../models/Utils');
const auth = require('../config/auth');

const utils = new Utils();

/* GET my notes */
router.get('/', auth.isUser, function(req, res) {
  const user = req.user;
  const notesByMeQuery = `select note_id, reply_to, text, username, frequency, timestamp, radius from
                          notes natural join schedules natural join users
                          where user_id = ${user.user_id}`;
  const getNotesByUsersQuery = `select note_id, text, username, timestamp from notes natural join users`;
  const myNotesWithQuoteAndSchedulesQuery = `select my_notes.*, all_notes.text as original_text, all_notes.username as original_postby, all_notes.timestamp as original_ts from
                                (${notesByMeQuery}) as my_notes
                                left join 
                                (${getNotesByUsersQuery}) as all_notes
                                on my_notes.reply_to = all_notes.note_id`;
  mysql_conn.query(myNotesWithQuoteAndSchedulesQuery, function (err, rows) {
    if (err) {
      console.log(err);
      res.render('my_notes', {
        errors: [{ param: `Server Error`, msg: `Internal server error on DB query`, value: '' }],
        title: 'My Notes'
      });
    } else {
      console.log(rows);
      res.render('my_notes', {
        title: 'My Notes',
        myNotesWithQuoteAndSchedulesQuery: rows,
        utils: utils
      });
    }
  });
});

/* GET delete my note */
router.get('/delete/:id', auth.isUser, function(req, res) {
  const note_id = req.params.id;

  const deleteNoteQuery = `delete from notes where note_id = '${note_id}';`;
  const deleteScheduleQuery = `delete from schedules where note_id = '${note_id}';`;
  const deleteTagQuery = `delete from tags where note_id = '${note_id}';`;

  mysql_conn.query(deleteNoteQuery, function (err) {
    if (err) {
      console.log(err);
      res.render('my_notes', {
        errors: [{ param: `Server Error`, msg: `Internal server error on DB query`, value: '' }],
        title: 'My Notes'
      });
    } else {
      mysql_conn.query(deleteScheduleQuery, function (err) {
        if (err) {
          console.log(err);
          res.render('my_notes', {
            errors: [{ param: `Server Error`, msg: `Internal server error on DB query`, value: '' }],
            title: 'My Notes'
          });
        } else {
          mysql_conn.query(deleteTagQuery, function (err) {
            if (err) {
              console.log(err);
              res.render('my_notes', {
                errors: [{ param: `Server Error`, msg: `Internal server error on DB query`, value: '' }],
                title: 'My Notes'
              });
            } else {
              res.redirect('/my_notes');
            }
          });
        }
      });
    }
  });
});


// Exports
module.exports = router;