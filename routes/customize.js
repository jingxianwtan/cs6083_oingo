const express = require('express');
const router = express.Router();

const mysql_conn = require('../models/MySqlConn');
const Utils = require('../models/Utils');
const utils = new Utils();
const auth = require('../config/auth');

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

/* POST set user current location */
router.post('/curr_time_and_location/:mode', auth.isUser, function(req, res) {
  const user = req.user;
  const mode = req.params.mode;
  const currLat = req.body.currLat;
  const currLon = req.body.currLon;
  const currDT = req.body.currDT;
  const tagLimit = req.query.tag;
  const currState = req.query.currState;

  if (mode === "custom") {
    utils.setUserTimeAndLocation(mysql_conn, user, currDT, currLat, currLon);
    if (!tagLimit) {
      res.redirect(`/notes?currState=${currState}&currLat=${currLat}&currLon=${currLon}&currDateTime=${currDT}`);
    } else {
      res.redirect(`/notes?tag=${tagLimit}&currState=default&currLat=${currLat}&currLon=${currLon}&currDateTime=${currDT}`)
    }
  } else { // mode === "default"
    utils.setUserTimeAndLocation(mysql_conn, user, currDT, 40.7539278, -73.9865007);
    if (!tagLimit) {
      res.redirect(`/notes?currState=${currState}&currLat=${40.7539278}&currLon=${-73.9865007}`);
    } else {
      res.redirect(`/notes?tag=${tagLimit}&currState=default&currLat=${40.7539278}&currLon=${-73.9865007}`)
    }
  }
});


module.exports = router;