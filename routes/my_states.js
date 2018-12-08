const uuid_v1 = require('uuid/v1'); // timestamp based uuid
const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const auth = require('../config/auth');

/* Get my states */
router.get('/', auth.isUser, function(req, res) {
  const user = req.user;

  const statesByUserQuery = `select * from states where user_id = ${user.user_id}`;
  mysql_conn.query(statesByUserQuery, function (err, rows) {
    if (err) console.log(err);

    res.render('my_states', {
      title: 'My States',
      states: rows
    });
  });
});

/* Get add state */
router.get('/add', auth.isUser, function(req, res) {
  res.render('add_state', {
    title: 'Add State',
    name: "",
    tags: "",
    keywords: "",
    withinRadius: "",
    postBy: "everyone"
  });
});

/* POST add state */
router.post('/add', function(req, res) {
  const user = req.user;

  req.checkBody("name", "State must have a getName").notEmpty();

  const name = req.body.name;
  const tags = req.body.tags;
  const keywords = req.body.keywords;
  const withinRadius = req.body.withinRadius;
  const postBy = req.body.postBy;

  const reqValidationErrors = req.validationErrors();
  const tagsError = validateMaximumTenWords(tags);
  const keywordsError = validateMaximumTenWords(keywords);
  const errors = getValidationErrorsForState(reqValidationErrors, tagsError, keywordsError);

  if (errors) {
    res.render('add_state', {
      errors: errors,
      title: 'Add State',
      user: user,
      name: name,
      tags: tags,
      keywords: keywords,
      withinRadius: withinRadius,
      postBy: postBy
    });
  } else {
    const state_id = uuid_v1();
    const insertStateQuery = `insert into states (state_id, user_id, name, tags, keywords, within_radius, post_by)
                              values ('${state_id}', ${user.user_id},'${name}', '${tags}', '${keywords}', ${withinRadius}, '${postBy}');`;
    mysql_conn.query(insertStateQuery, function(err) {
      if (err) console.log(err);

      req.flash('success', 'A new state has been added!');
      res.redirect('/my_states');
    });
  }
});

/* Get edit state */
router.get('/edit/:id', auth.isUser, function(req, res) {
  const state_id = req.params.id;
  const user = req.user;

  const getStateQuery = `select * from states where state_id = '${state_id}';`;
  mysql_conn.query(getStateQuery, function(err, rows) {
    if (err) console.log(err);

    const state = rows[0];
    res.render('edit_state', {
      title: 'Edit State',
      user: user,
      state: state
    });
  });
});

/* POST edit state */
router.post('/edit/:id', function(req, res) {
  const state_id = req.params.id;
  const user = req.user;

  req.checkBody("name", "State must have a getName").notEmpty();

  const name = req.body.name;
  const tags = req.body.tags;
  const keywords = req.body.keywords;
  const withinRadius = req.body.withinRadius;
  const postBy = req.body.postBy;

  const errors = req.validationErrors();

  if (errors) {
    res.render('edit_state', {
      errors: errors,
      title: 'Edit State',
      user: user,
      name: name,
      tags: tags,
      keywords: keywords,
      postBy: postBy
    });
  } else {
    const updateStateQuery = `update states set
                                name = '${name}',
                                user_id = ${user.user_id},
                                tags = '${tags}',
                                keywords = '${keywords}',
                                within_radius = ${withinRadius},
                                post_by = '${postBy}'
                              where state_id = '${state_id}';`;
    mysql_conn.query(updateStateQuery, function(err) {
      if (err) console.log(err);

      req.flash('success', 'The state has been edited!');
      res.redirect('/my_states');
    });
  }
});

/* Get delete state */
router.get('/delete/:id', auth.isUser, function(req, res) {
  const state_id = req.params.id;

  const deleteStateQuery = `delete from states where state_id = '${state_id}';`;
  mysql_conn.query(deleteStateQuery, function(err) {
    if (err) console.log(err);

    res.redirect('/my_states');
  });
});

/* POST set current state */
router.post('/set-current', function(req, res) {
  const currState = req.body.currState;
  res.redirect(`/notes?currState=${currState}`);
});


function validateMaximumTenWords(input) {
  if (input == null || input.split(";").map(word => word.trim()).length <= 10) {
    return {};
  } else {
    return { param: `${input}`, msg: `Number of ${input} cannot exceed 10`, value: '' }
  }
}

function getValidationErrorsForState(reqValidationErrors, tagError, keywordError) {

  let errorsForTagsAndKeywords = [tagError, keywordError].filter(error => Object.keys(error).length !== 0);

  if (reqValidationErrors instanceof Array) {
    return reqValidationErrors.concat(errorsForTagsAndKeywords);
  } else if (errorsForTagsAndKeywords.length) {
    return errorsForTagsAndKeywords;
  } else {
    return undefined;
  }
}


// Exports
module.exports = router;