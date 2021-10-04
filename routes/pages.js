const express = require('express');
const router = express.Router();
const table_main = require('../lib/main_table');
const templates = require('../lib/templates');

// main table - create
router.get('/create', (req, res) => {
   const authentication = req.session.isLogin;

   if (authentication) {
      table_main.create(req, res, authentication);
   } else {
      res.redirect('/login');
   }
});

router.post('/process_create', (req, res) => {

   table_main.process_create(req, res);

})

// main table - update
router.get('/update/:table_main_id', (req, res) => {
   const authentication = req.session.isLogin;
   if (authentication) {
      table_main.update(req, res, authentication);
   } else {
      res.redirect('/login');
   }
});
router.post('/process_update', (req, res) => {

   table_main.process_update(req, res);

});

// main table - delete
router.get('/delete/:table_main_id', (req, res) => {
   const authentication = req.session.isLogin;

   if (authentication) {
      table_main.delete(req, res, authentication);
   } else {
      res.redirect('/login');
   }
});
router.post('/process_delete', (req, res) => {

   table_main.process_delete(req, res);

});

// main table - page with ID
router.get('/:pageID', async (req, res, next) => {
   const authentication = req.session.isLogin;

   if (authentication) {
      const list = templates.HTML_LIST(req.tableRecords);

      try {
         await table_main.page(req, res, list, authentication);
      } catch (err) {
         next(err);
      }
   } else {
      res.redirect('/login');
   }
});

module.exports = router;