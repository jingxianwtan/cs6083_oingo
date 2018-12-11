const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mysql_conn = require('../models/MySqlConn');

module.exports = function(passport) {
  passport.use(new LocalStrategy(function(username, password, done) {
    if (!username || !password) {
      return done(null, false, {message: 'Username and password are both required!'});
    }

    mysql_conn.query(`select * from users where username = '${username}'`, function (err, rows) {
      if (err) console.log(err);

      if (!rows.length) {
        return done(null, false, {message: 'No users were found!'})
      }

      bcrypt.compare(password, rows[0].password, function(err, isMatch) {
        if (err) console.log(err);

        if (isMatch) {
          return done(null, rows[0]); // RowDataPacket { user_id: 1, username: 'williamtan', password: '12345678' }
        } else {
          return done(null, false, {message: 'Wrong password!'});
        }
      })
    });

  }));

  passport.serializeUser(function(sqlRow, done) {
    done(null, sqlRow.user_id);
  });

  passport.deserializeUser(function(id, done){
    mysql_conn.query(`select * from users where user_id = ${id}`, function (err, rows){
      if (err) console.log(err);

      done(err, rows[0]);
    });
  });
};