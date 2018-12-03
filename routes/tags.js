const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const StringUtil = require('../models/Utils');
const auth = require('../config/auth');

/* GET tags by tag */
router.get('/:tag', auth.isUser, function(req, res) {
  const tag = req.params.tag;

  const notesWithTagQuery = `select tag, text, username, timestamp from
                                (select tag, text, user_id, timestamp from 
                                notes join tags on notes.note_id = tags.note_id 
                                where tag = '${tag}') as notes_with_tag
                            join users on notes_with_tag.user_id = users.user_id;`;
  mysql_conn.query(notesWithTagQuery, function (err, rows) {
    if (err) console.log(err);

    res.render('notes', {
      title: 'Notes',
      notes: rows,
      stringUtil: new StringUtil()
    });
  });
});

// Exports
module.exports = router;