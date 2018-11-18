const http = require('http');
const db_config = require('./config/database');
const mysql = require('mysql');

const hostname = '127.0.0.1';
const port = 3000;

const mysql_conn = mysql.createConnection({
  host: db_config.host,
  user: db_config.user,
  password: db_config.password,
  port: db_config.port
});

mysql_conn.connect(function(err) {
  if (err) throw err;
  console.log("MySQL Database connected!");
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});