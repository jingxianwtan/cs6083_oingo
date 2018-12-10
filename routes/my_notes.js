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
  const notesByMeQuery = `select note_id, reply_to, text, username, frequency, timestamp from
                          notes natural join schedules natural join users
                          where user_id = ${user.user_id}`;
  const getNotesByUsersQuery = `select note_id, text, username, timestamp from notes natural join users`;
  const myNotesWithQuoteAndSchedulesQuery = `select my_notes.*, all_notes.text as original_text, all_notes.username as original_postby, all_notes.timestamp as original_ts from
                                (${notesByMeQuery}) as my_notes
                                join 
                                (${getNotesByUsersQuery}) as all_notes
                                on my_notes.reply_to = all_notes.note_id`;
  console.log(myNotesWithQuoteAndSchedulesQuery);
  mysql_conn.query(myNotesWithQuoteAndSchedulesQuery, function (err, rows) {
    if (err) console.log(err);

    res.render('my_notes', {
      title: 'My Notes',
      myNotesWithQuoteAndSchedulesQuery: rows,
      utils: utils
    });
  });
});

/* GET delete my note */
router.get('/delete/:id', auth.isUser, function(req, res) {
  const note_id = req.params.id;

  const deleteNoteQuery = `delete from notes where note_id = '${note_id}';`;
  const deleteScheduleQuery = `delete from schedules where note_id = '${note_id}';`;
  const deleteTagQuery = `delete from tags where note_id = '${note_id}';`;

  mysql_conn.query(deleteNoteQuery, function (err) {
    if (err) console.log(err);

    mysql_conn.query(deleteScheduleQuery, function (err) {
      if (err) console.log(err);

      mysql_conn.query(deleteTagQuery, function (err) {
        if (err) console.log(err);
        res.redirect('/my_notes');
      });
    });
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
    });
    updateTagsInNote(note_id, note_attributes.text);

    res.redirect('/my_notes');
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

function updateTagsInNote(note_id, text) {
  const newTags = utils.getTagsFromText(text);

  const getTagsQuery = `select tag from tags where note_id = '${note_id}';`;
  mysql_conn.query(getTagsQuery, function(err, rows) {
    if (err) console.log(err);
    console.log(newTags);
    console.log(rows);

    if (rows.length) {
      let tagsToBeDeleted = [];
      let tagsToBeAdded = [];

      for (let i in newTags) {
        let foundInOldTags = false;
        for (let j in rows) {
          if (newTags[i] === rows[j].tag) {
            foundInOldTags = true;
            break;
          }
        }
        if (!foundInOldTags) tagsToBeAdded.push(newTags[i]);
      }
      console.log(tagsToBeAdded);

      for (let j in rows) {
        let foundInNewTags = false;
        for (let i in newTags) {
          if (newTags[i] === rows[j].tag) {
            foundInNewTags = true;
            break;
          }
        }
        if (!foundInNewTags) tagsToBeDeleted.push(rows[j].tag);
      }
      console.log(tagsToBeDeleted);

      if (tagsToBeAdded.length) {
        const insertTagValues = tagsToBeAdded.map(tag => `('${tag}', '${note_id}')`);
        const insertTagsQuery = `insert into tags (tag, note_id) values ${insertTagValues.join(', ')};`;
        mysql_conn.query(insertTagsQuery, function(err) {
          if (err) console.log(err);
        });
      }

      if (tagsToBeDeleted.length) {
        const deleteTagValues = tagsToBeDeleted.map(tag => `(tag = '${tag}' and note_id = '${note_id}')`);
        const deleteTagsQuery = `delete from tags where ${deleteTagValues.join(' or ')};`;
        mysql_conn.query(deleteTagsQuery, function(err) {
          if (err) console.log(err);
        });
      }

    } else {
      const insertTagValues = utils.getTagsFromText(text).map(tag => `('${tag}', '${note_id}')`);
      if (insertTagValues.length) {
        const insertTagsQuery = `insert into tags (tag, note_id) values ${insertTagValues.join(', ')};`;
        mysql_conn.query(insertTagsQuery, function(err) {
          if (err) console.log(err);
        });
      }
    }
  });
}


// Exports
module.exports = router;