const mysql = require('mysql');

// db와 연결
const db = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '000000',
   database: 'opentutorials',
});
db.connect();

module.exports = db;