const uuid_v1 = require('uuid/v1'); // timestamp based uuid
const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const StringUtil = require('../models/StringUtil');
const Schedule = require('../models/Schedule');
const auth = require('../config/auth');

/* GET notes index */
router.get('/', auth.isUser, function(req, res) {
  const notesByUserQuery = `select note_id, username, text, timestamp from 
                            notes join users on notes.user_id = users.user_id;`;
  mysql_conn.query(notesByUserQuery, function (err, rows) {
    if (err) console.log(err);

    res.render('notes', {
      title: 'Notes',
      notes: rows,
      stringUtil: new StringUtil()
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
  const user = req.user;

  req.checkBody("text", "Note text cannot be empty").notEmpty();
  req.checkBody("visibility", "Visibility must be defined").notEmpty();
  req.checkBody("radius", "Radius must be defined").notEmpty();
  req.checkBody("frequency", "Frequency must be defined").notEmpty();

  const text = req.body.text;
  const radius = req.body.radius;
  const visibility = req.body.visibility;

  const startTime = req.body.start_time;
  const endTime = req.body.end_time;
  const startDate = req.body.start_date;
  const endDate = req.body.end_date;
  const frequency = req.body.frequency;

  const schedule = new Schedule(startDate, endDate, startTime, endTime, frequency);
  console.log(schedule.startDate());
  console.log(schedule.startTime());

  console.log(req.body);

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
    const note_id = uuid_v1();
    const insertUserQuery = `insert into notes (note_id, user_id, text, lat, lon, timestamp, radius, visibility)
                      values ('${note_id}', ${user.user_id},'${text}','lat','long','2018-11-19 12:00:00', ${radius}, '${visibility}');`;
    mysql_conn.query(insertUserQuery, function(err) {
      console.log("here1");
      if (err) console.log(err);

      insertSchedule(schedule, note_id);

      const insertTagValues = getTagsFromText(text).map(tag => `('${tag}', '${note_id}')`);
      if (!insertTagValues.length) {
        req.flash('success', 'A new note has been added!');
        res.redirect('/notes');
      } else {
        const insertTagQuery = `insert into tags (tag, note_id) values ${insertTagValues.join(', ')};`;
        mysql_conn.query(insertTagQuery, function(err) {
          console.log("here2");
          if (err) console.log(err);

          req.flash('success', 'A new note has been added!');
          res.redirect('/notes');
        });
      }
    });
  }
});

function getTagsFromText(text) {
  const tagRegex = /(^|)#([\w]+)/gm;

  let matches = [];
  let match;
  while (match = tagRegex.exec(text)) {
    matches.push(match[2]);
  }
  return matches;
}

function insertSchedule(schedule, note_id) {
  const insertScheduleQuery = `insert into schedules (note_id, start_time, end_time, start_date, end_date, frequency) 
                              values ('${note_id}', '${schedule.startTime()}', '${schedule.endTime()}', 
                              '${schedule.startDate()}', '${schedule.endDate()}', '${schedule.frequency}');`;
  mysql_conn.query(insertScheduleQuery, function(err) {
    console.log("here3");
    if (err) console.log(err);
  });
}

// Exports
module.exports = router;
