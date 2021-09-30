const mysql = require('mysql');

// db와 연결
const db = mysql.createConnection({
   host: '',
   user: '',
   password: '',
   database: '',
});
db.connect();

module.exports = db;