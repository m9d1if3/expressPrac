const express = require('express');
const router = express.Router();
const table_login = require('../lib/login_table');


router.get('/', (req, res) => {
   const authentication = req.checkLogIn;
   table_login.login(req, res, authentication.isLogin);
});

router.post('/process', (req, res) => {
   table_login.process_login(req, res);
});

router.get('/process_logout', (req, res) => {
   table_login.process_logout(req, res);
});

module.exports = router;