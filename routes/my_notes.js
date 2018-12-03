const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const Utils = require('../models/Utils');
const auth = require('../config/auth');

const utils = new Utils();

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
      stringUtil: utils
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
    console.log(utils.getDateString(noteWithSchedule.start_date));
    console.log(utils.getDateString(noteWithSchedule.end_date));
    res.render('edit_note', {
      title: 'Edit Notes',
      id: note_id,
      text: noteWithSchedule.text,
      radius: noteWithSchedule.radius,
      visibility: noteWithSchedule.visibility,
      start_date: utils.getDateString(noteWithSchedule.start_date),
      end_date: utils.getDateString(noteWithSchedule.end_date),
      start_time: noteWithSchedule.start_time,
      end_time: noteWithSchedule.end_time,
      frequency: noteWithSchedule.frequency,
      lat: noteWithSchedule.lat,
      lon: noteWithSchedule.lon
    });
  });
});

/* POST edit my note */
router.post('/edit/:id', auth.isUser, function(req, res) {
  const note_id = req.params.id;

  const note_attributes = {
    text: req.body.text,
    radius: req.body.radius,
    visibility: req.body.visibility,
    lat: req.body.lat,
    lon: req.body.lon
  };

  const schedule_attributes = {
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    frequency: req.body.frequency,
  };

  const nonNullNoteQuery = getNonNullAttrQuery(utils.getNonNullAttributes(note_attributes));
  const nonNullScheduleQuery = getNonNullAttrQuery(utils.getNonNullAttributes(schedule_attributes));

  const updateNoteQuery = `update notes set ${nonNullNoteQuery} where note_id = '${note_id}';`;
  const updateScheduleQuery = `update schedules set ${nonNullScheduleQuery} where note_id = '${note_id}';`;
  mysql_conn.query(updateNoteQuery, function (err) {
    if (err) console.log(err);

    mysql_conn.query(updateScheduleQuery, function(err) {
      if (err) console.log(err);

      res.redirect('/my_notes');
    });
  });
});


function getNonNullAttrQuery(nonNullAttrs) {
  let queryStrs = [];
  for (let key in nonNullAttrs) {
    if (nonNullAttrs.hasOwnProperty(key)) {
      if (key === 'lat' || key === 'lon' || key === 'radius') {
        queryStrs.push(`${key} = ${nonNullAttrs[key]}`);
      } else {
        queryStrs.push(`${key} = '${nonNullAttrs[key]}'`);
      }
    }
  }
  return queryStrs.join(", ");
}


// Exports
module.exports = router;