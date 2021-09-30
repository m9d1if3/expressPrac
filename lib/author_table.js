const qs = require('querystring');
const db = require('./db');
const path = require('path');
const url = require('url');
const templates = require('./templates');
const urlParams = require('./getURLparams');
const sanitizeHTML = require('sanitize-html');
const styleSheet_table = templates.HTML_CSS('../css/table.css');

const TABLE_NAME_AUTH = 'author';
const PARAM_NAME_AUTHID = 'author_id';
const PARAM_PORT_NUM = 3000;

exports.home = function (request, response) {
   const title = 'Authors'

   db.query(`SELECT * FROM ${TABLE_NAME_AUTH}`, (err, results) => {
      const tables = templates.HTML_AUTH_TABLE(results,
         `<style>
            table{
               border-collapse: collapse;
            }
            td{
               padding: 10px;
               border: 1px solid black;
            }
            #auth_form_del input{
               padding: 5px;
               border-radius: 10px;
               background: white;
               transition: 1s;
            }
            #auth_form_del input:hover{
               background: silver;
            }
         </style>`);

      let htmlTemplate = templates.HTML_TEMPLATE(`
      <h3>
      ${sanitizeHTML(title)}
      <a href='/author/signUp'>sign up</a>
      </h3>
      <p>${tables}</p>`
         , styleSheet_table);

      response.writeHead(200);
      response.end(htmlTemplate);
   });
};

exports.signUp = function (request, response) {

   let htmlTemplate = templates.HTML_TEMPLATE(`
      <h2>SIGN-UP PAGE</h2>
      <form action="/author/process_signUp" method="post">
         <input type="text" name="author_name" placeholder="name"/>
         <input type="text" name="author_profile" placeholder="profile"/>
         <input type="submit" value="submit"/>
      </form>
   `);

   response.writeHead(200);
   response.end(htmlTemplate);
};

exports.process_signUp = function (request, response) {
   let body = '';

   request.on('err', (err) => {
      console.log(err);
   }).on('data', (chunk) => {
      body += chunk;
   }).on('end', () => {
      response.on('err', (err) => {
         console.log(err);
      })

      let post = qs.parse(body);
      let author_name = post.author_name;
      let author_profile = post.author_profile;

      db.query(`INSERT INTO ${TABLE_NAME_AUTH} (name, profile) VALUES (?, ?)`,
         [author_name, author_profile],
         (err, results) => {
            if (err) throw err;

            response.writeHead(302, { Location: encodeURI(`/author`) });
            response.end();
         });
   });
}

exports.update = function (request, response) {

   const queryObj = urlParams.getURLparamsObj(PARAM_PORT_NUM, request);
   const queryAuthID = queryObj.get(`${PARAM_NAME_AUTHID}`);
   const filteredID = path.parse(queryAuthID).base;

   db.query(`SELECT * FROM ${TABLE_NAME_AUTH} WHERE id=?`, [filteredID], (err, results) => {
      if (err) throw err;

      let htmlTemplate = templates.HTML_TEMPLATE(`
            <h3>UPDATE author</h3>
            <form action="/author/process_update" method="post">
               <input type="hidden" name="author_id" value="${sanitizeHTML(results[0].id)}" />
               <input type="text" name="author_name" value="${sanitizeHTML(results[0].name)}"/>
               <input type="text" name="author_profile" value="${sanitizeHTML(results[0].profile)}"/>
               <br><br>
               <input type="submit" value="submit"/>
            </form>
         `);
      response.writeHead(200);
      response.end(htmlTemplate);
   })
}

exports.process_update = function (request, response) {
   let body = '';

   request.on('err', (err) => {
      console.log(err);
   }).on('data', (chunk) => {
      body += chunk;
   }).on('end', () => {
      response.on('err', (err) => {
         console.log(err);
      });

      let post = qs.parse(body);
      let id = post.author_id;
      let name = post.author_name;
      let profile = post.author_profile;

      db.query(`UPDATE ${TABLE_NAME_AUTH} SET name=?, profile=? WHERE id=?`,
         [name, profile, id], (err, results) => {
            if (err) throw err;

            response.writeHead(302, { Location: encodeURI(`/author`) });
            response.end();
         })
   });
}

exports.process_delete = function (request, response) {
   let body = '';

   request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1e6) request.socket.destroy();
   });

   request.on('end', () => {
      let post = qs.parse(body);
      let id = post.author_id;

      db.query(`DELETE FROM ${TABLE_NAME_AUTH} WHERE id=?`, [id], (err, results) => {
         if (err) throw err;

         response.writeHead(302, { Location: encodeURI(`/author`) });
         response.end();
      })
   });
}