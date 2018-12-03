const uuid_v1 = require('uuid/v1'); // timestamp based uuid
const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const Utils = require('../models/Utils');
const Schedule = require('../models/Schedule');
const auth = require('../config/auth');

const utils = new Utils();

/* GET notes index */
router.get('/', auth.isUser, function(req, res) {
  const notesByUserQuery = `select text, username, timestamp from
                              (select text, notes.user_id, timestamp from
                                (select friend_id from friendships where user_id = '1') as my_friends
                              right join notes on notes.user_id = my_friends.friend_id
                              where visibility = 'everyone' 
                                or (visibility = 'friends' and friend_id is not null) 
                                or notes.user_id = '1') as notes_visible
                            join users on notes_visible.user_id = users.user_id;`;
  mysql_conn.query(notesByUserQuery, function (err, rows) {
    if (err) console.log(err);

    res.render('notes', {
      title: 'Notes',
      notes: rows,
      stringUtil: utils
    });
  });
});

/* GET add note */
router.get('/add-note', auth.isUser, function(req, res) {
  res.render('add_note', {
    title: 'Add Note',
    text: "",
    radius: "",
    visibility: "",
    start_time: "",
    end_time: "",
    start_date: "",
    end_date: "",
    frequency: "",
    lat: "",
    lon: ""
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
  const lat = req.body.lat;
  const lon = req.body.lon;
  const currDateTime = new Date();
  console.log(currDateTime);

  const schedule = new Schedule(currDateTime, startDate, endDate, startTime, endTime, frequency);
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
                            values ('${note_id}', ${user.user_id},'${text}','${lat}','${lon}',
                                    '${schedule.currDateTime()}', ${radius}, '${visibility}');`;
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

/* POST edit geo */
router.post('/edit-geo/:loc', auth.isUser, function(req, res) {
  const user = req.user;

  const location = req.params.loc;

  const text = req.body.text;
  const radius = req.body.radius;
  const visibility = req.body.visibility;

  const startTime = req.body.start_time;
  const endTime = req.body.end_time;
  const startDate = req.body.start_date;
  const endDate = req.body.end_date;
  const frequency = req.body.frequency;

  const geoLocations = {
    'empire_state': [40.748440, -73.985664],
    'nyu_tandon': [40.693710, -73.987221],
    'chelsea': [40.742451, -74.005959]
  };

  console.log(geoLocations[location]);

  res.render('add_note', {
    title: 'Add Note',
    user: user,
    text: text,
    radius: radius,
    visibility: visibility,
    start_time: startTime,
    end_time: endTime,
    start_date: utils.getDateString(startDate),
    end_date: utils.getDateString(endDate),
    frequency: frequency,
    lat: geoLocations[location][0],
    lon: geoLocations[location][1]
  });
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
