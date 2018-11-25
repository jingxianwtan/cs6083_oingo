const db_config = require('../config/database');
const mysql = require('mysql');

const mysql_conn = mysql.createConnection(db_config);

// Connect to MySQL Database
mysql_conn.connect(function(err) {
  if (err) throw err;
  console.log(`MySQL Database connected at ${db_config.host} on port ${db_config.port}!`);
});

module.exports = mysql_conn;
