const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const StringUtil = require('../models/StringUtil');
const auth = require('../config/auth');

/* GET my notes */
router.get('/', auth.isUser, function(req, res) {
  const user = req.user;
  console.log(user);
  const notesByMeQuery = `select note_id, text, username, timestamp from
                          notes join users on notes.user_id = users.user_id
                          where notes.user_id = ${user.user_id};`;
  mysql_conn.query(notesByMeQuery, function (err, rows) {
    if (err) console.log(err);

    res.render('my_notes', {
      title: 'My Notes',
      notes: rows,
      stringUtil: new StringUtil()
    });
  });
});

/* GET delete my note */
router.get('/delete/:id', auth.isUser, function(req, res) {
  const note_id = req.params.id;
  const deleteNoteQuery = `delete from notes where note_id = '${note_id}'`;
  mysql_conn.query(deleteNoteQuery, function (err) {
    if (err) console.log(err);

    res.redirect('/my_notes');
  });
});

/* GET edit my note */
router.get('/edit/:id', auth.isUser, function(req, res) {
  const note_id = req.params.id;

  const getNoteQuery = `select * from notes natural join schedules where note_id = '${note_id}';`;
  mysql_conn.query(getNoteQuery, function (err, rows) {
    if (err) console.log(err);

    const noteWithSchedule = rows[0];
    console.log(noteWithSchedule);
    // console.log(getDateString(noteWithSchedule.end_date));
    res.render('edit_note', {
      title: 'Edit Notes',
      id: note_id,
      text: noteWithSchedule.text,
      radius: noteWithSchedule.radius,
      visibility: noteWithSchedule.visibility,
      start_date: getDateString(noteWithSchedule.start_date),
      end_date: getDateString(noteWithSchedule.end_date),
      start_time: noteWithSchedule.start_time,
      end_time: noteWithSchedule.end_time,
      frequency: noteWithSchedule.frequency
    });
  });
});

/* POST edit my note */
router.post('/edit/:id', auth.isUser, function(req, res) {
  const note_id = req.params.id;

  const text = req.body.text;

  const updateNoteQuery = `update notes set 
                            text = '${text}' 
                            where note_id = '${note_id}';`;
  mysql_conn.query(updateNoteQuery, function (err) {
    if (err) console.log(err);

    res.redirect('/my_notes');
  });
});

function getDateString(datetime) {
  return `${datetime.getFullYear()}-${datetime.getMonth() + 1}-${datetime.getDate()}`;
}

// Exports
module.exports = router;