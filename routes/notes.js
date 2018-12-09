const uuid_v1 = require('uuid/v1'); // timestamp based uuid
const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const Utils = require('../models/Utils');
const Schedule = require('../models/Schedule');
const State = require('../models/State');
const Filter = require('../models/Filter');
const auth = require('../config/auth');

const utils = new Utils();

/* GET notes index */
router.get('/', auth.isUser, function(req, res) {
  const user = req.user;
  const currState = getCurrState(req.query.currState);
  let currDateTime = new Date();
  // update user curr time;
  // manually set user curr time;

  const currTime = utils.getTimeOfDay(currDateTime);
  const currDate = utils.getDateString(currDateTime);



  const currStatesQuery = `select * from states where user_id = ${user.user_id} and name = '${currState}';`;
  const allMyStatesQuery = `select * from states where user_id = ${user.user_id};`;
  const visibilityQuery = `(  (visibility = 'everyone')
                              or (visibility = 'friends' and friend_id is not null) 
                              or (notes.user_id = '${user.user_id}')  )`;
  const frequencyQuery = `( (frequency = 'daily' 
                                and start_date <= '${currDate}' and end_date >= '${currDate}'
                                and start_time <= '${currTime}' and end_time >= '${currTime}')
                            or (frequency = 'weekly' 
                                and start_date <= '${currDate}' and end_date >= '${currDate}' 
                                and start_time <= '${currTime}' and end_time >= '${currTime}'
                                and mod(timestampdiff(day, start_date, '2018-12-09'), 7) = 0)
                            or (frequency = 'monthly'
                                and start_date <= '${currDate}' and end_date >= '${currDate}' 
                                and start_time <= '${currTime}' and end_time >= '${currTime}' 
                                and dayofmonth(start_date) = ${currDateTime.getDate()})
                            or (frequency = 'annual' 
                                and start_date <= '${currDate}' and end_date >= '${currDate}'
                                and start_time <= '${currTime}' and end_time >= '${currTime}'
                                and month(start_date) = ${currDateTime.getMonth() + 1} 
                                and dayofmonth(start_date) = ${currDateTime.getDate()}) )`;
  // Need to add start_date and end_date range
  const notesByUserQuery2 = `select * from
                              (select text, notes_visible.user_id, username, timestamp, 69.0 * degrees(acos(
                                          least(cos(radians(notes_visible.lat)) * cos(radians(my_loc.curr_lat)) 
                                                  * cos(radians(notes_visible.lon - my_loc.curr_lon))
                                                  + sin(radians(notes_visible.lat)) * sin(radians(my_loc.curr_lat)), 
                                                1.0))) as dist_in_mile, radius from
                                (select text, notes.user_id, timestamp, lat, lon, radius, start_date, end_date, start_time, end_time, frequency from
                                  (select friend_id from friendships where user_id = '${user.user_id}') as my_friends
                                  right join notes on notes.user_id = my_friends.friend_id
                                  join schedules on notes.note_id = schedules.note_id
                                  where ${visibilityQuery}
                                  and 
                                  ${frequencyQuery}) as notes_visible
                              join 
                              (select curr_lat, curr_lon from user_locations where user_id = '${user.user_id}') as my_loc
                              join users on notes_visible.user_id = users.user_id) as notes_visible_within_radius
	                          where dist_in_mile <= radius`;
  console.log(notesByUserQuery2);

  mysql_conn.query(currStatesQuery, function (err, currStates) {
    if (err) console.log(err);

    const state = new State(currStates[0]);
    const filter = new Filter(state.getTags(), state.getKeywords(), state.getWithinRadius(), state.getPostBy(), user);
    const filtersQuery = filter.getFiltersQuery();

    const notesByUserStateQuery = `${notesByUserQuery2}${filtersQuery};`;

    mysql_conn.query(notesByUserStateQuery, function (err, notes) {
      if (err) console.log(err);

      mysql_conn.query(allMyStatesQuery, function (err, myStates) {
        res.render('notes', {
          title: 'Notes',
          notes: notes,
          currState: currState,
          myStates: myStates,
          utils: utils
        });
      });
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
  console.log("debug msg");

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
      radius: radius,
      visibility: visibility,
      start_time: startTime,
      end_time: endTime,
      start_date: startDate,
      end_date: endDate,
      frequency: frequency,
      lat: lat,
      lon: lon
    });
  } else {
    const note_id = uuid_v1();
    const insertUserQuery = `insert into notes (note_id, user_id, text, lat, lon, timestamp, radius, visibility)
                            values ('${note_id}', ${user.user_id},'${text}', ${lat}, ${lon},
                                    '${schedule.currDateTime()}', ${radius}, '${visibility}');`;
    mysql_conn.query(insertUserQuery, function(err) {
      if (err) console.log(err);

      insertSchedule(schedule, note_id);

      const insertTagValues = utils.getTagsFromText(text).map(tag => `('${tag}', '${note_id}')`);
      if (!insertTagValues.length) {
        req.flash('success', 'A new note has been added!');
        res.redirect('/notes');
      } else {
        const insertTagQuery = `insert into tags (tag, note_id) values ${insertTagValues.join(', ')};`;
        mysql_conn.query(insertTagQuery, function(err) {
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
  console.log(frequency);

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


function insertSchedule(schedule, note_id) {
  const insertScheduleQuery = `insert into schedules (note_id, start_time, end_time, start_date, end_date, frequency) 
                              values ('${note_id}', '${schedule.startTime()}', '${schedule.endTime()}', 
                              '${schedule.startDate()}', '${schedule.endDate()}', '${schedule.frequency()}');`;
  mysql_conn.query(insertScheduleQuery, function(err) {
    if (err) console.log(err);
  });
}

function getCurrState(currStateFromReq) {
  if (currStateFromReq == null || currStateFromReq === 'undefined') {
    return 'default';
  } else {
    return currStateFromReq;
  }
}

function calcDistanceQuery() {
  `69.0 *
  DEGREES(ACOS(LEAST(COS(RADIANS(notes_visible.lat))
    * COS(RADIANS(my_loc.lat))
    * COS(RADIANS(notes_visible.lon - my_loc.lon))
    + SIN(RADIANS(notes_visible.lat))
    * SIN(RADIANS(my_loc.lat)), 1.0)))`;
}

// Exports
module.exports = router;
