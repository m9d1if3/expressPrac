const express = require('express');
const router = express.Router();
const table_main = require('../lib/main_table');
const templates = require('../lib/templates');
const checkLogin = require('../lib/checkLogIn');

// routing 방식(미들웨어)으로 구현
// main table - home
router.get('/', (req, res) => {
   const authentication = req.checkLogIn;
   
   if (authentication.isLogin) {
      const list = templates.HTML_LIST(req.tableRecords);
      table_main.home(req, res, list, authentication.isLogin);
   }
   else {
      res.redirect('/login');
   }
});
module.exports = router;