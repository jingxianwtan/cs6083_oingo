const uuid_v1 = require('uuid/v1'); // timestamp based uuid
const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const Utils = require('../models/Utils');
const utils = new Utils();
const auth = require('../config/auth');


/* GET reply note */
router.get('/:id', auth.isUser, function(req, res) {
  const note_id = req.params.id;

  const getNoteQuery = `select * from notes join users on notes.user_id = users.user_id where note_id = '${note_id}'`;
  mysql_conn.query(getNoteQuery, function (err, rows) {
    if (err) console.log(err);

    res.render('reply_note', {
      title: 'Reply Note',
      note: rows[0],
      replyMsg: "",
      utils: utils
    });
  });
});

/* POST reply note */
router.post('/:id', auth.isUser, function(req, res) {
  const user = req.user;
  const reply_to = req.params.id;
  const replyMessage = req.body.replyMsg;

  const getNoteQuery = `select * from notes join users on notes.user_id = users.user_id where note_id = '${reply_to}'`;
  mysql_conn.query(getNoteQuery, function (err, rows) {
    if (err) console.log(err);

    const note_id = uuid_v1();
    const noteReplied = rows[0];
    const insertReplyQuery = `insert into notes (note_id, reply_to, user_id, text, lat, lon, timestamp, radius, visibility)
                            values ('${note_id}', '${reply_to}', ${user.user_id},'${replyMessage}', ${noteReplied.lat}, ${noteReplied.lon},
                                    '${utils.getDateTimeString(new Date())}', ${noteReplied.radius}, '${noteReplied.visibility}');`;
    const getScheduleQuery = `select * from schedules where note_id = '${noteReplied.note_id}'`;
    mysql_conn.query(getScheduleQuery, function(err, schedules) {
      if (err) console.log(err);

      mysql_conn.query(insertReplyQuery, function(err) {
        if (err) console.log(err);

        const schedule = schedules[0];
        const insertScheduleQuery = `insert into schedules (note_id, start_time, end_time, start_date, end_date, frequency) 
                              values ('${note_id}', '${schedule.start_time}', '${schedule.end_time}', 
                              '${utils.getDateString(schedule.start_date)}', '${utils.getDateString(schedule.end_date)}', '${schedule.frequency}');`;
        mysql_conn.query(insertScheduleQuery, function(err) {
          if (err) console.log(err);

          res.redirect('/notes');
        });
      });
    });
  });
});


module.exports = router;