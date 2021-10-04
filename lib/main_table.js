const templates = require('./templates');
const db = require('./db');
const path = require('path');
const sanitizeHTML = require('sanitize-html');


const TABLE_NAME_MAIN = 'topic';
const TABLE_NAME_AUTH = 'author';
const PATH_STATIC_HOMECSS = '/css/home.css';

exports.home = function (request, response, list, authentication) {
   const title = 'HOME';
   const desc = 'Welcome to Server & MySQL..';

   let htmlTemplate = templates.HTML_TEMPLATE(`${list}
                     <h1>
                     ${sanitizeHTML(title)}
                     </h1>
                     <p>${sanitizeHTML(desc)}</p>`,
      templates.HTML_CSS(PATH_STATIC_HOMECSS),
      templates.HTML_AUTHENTICATION(authentication));
   response.send(htmlTemplate);
}

exports.page = function async (request, response, list, authentication) {
   const pageID = request.params.pageID;
   const filteredID = path.parse(pageID).base;

   // db query 기능으로 구현
   // ? 처리 후 다음 인자에 값을 주면, 자동으로 공격적인 값 입력을 세탁해주는 효과가 있다.

   return new Promise((resolve, reject) => {
      db.query(`SELECT ${TABLE_NAME_MAIN}.id, title, description, created, author_id, name, profile FROM ${TABLE_NAME_MAIN} 
            LEFT JOIN ${TABLE_NAME_AUTH} ON ${TABLE_NAME_MAIN}.author_id=${TABLE_NAME_AUTH}.id
            WHERE ${TABLE_NAME_MAIN}.id=?`, [filteredID], (err, results) => {
         if (results.length === 0) {
            return reject(err);
         } else {
            const id = results[0].id;
            const title = results[0].title;
            const description = results[0].description;
            const name = results[0].name;
            const profile = results[0].profile;

            const htmlTemplate = templates.HTML_TEMPLATE(`${list}
                           <h1>
                           ${sanitizeHTML(title)}
                           <h1>
                           
                           <h2>
                           <span id="utils" style="font-size:15px">
                           <a href="/page/update/${id}">update</a>
                           <a href="/page/delete/${id}">delete</a>
                           <span>
                           </h2>

                           <p style="font-size:13px; font-style:italic">
                           by ${sanitizeHTML(name)} (${sanitizeHTML(profile)})
                           </p>

                           <div class="div_pageDesc">
                           ${sanitizeHTML(description, {
                              allowedTags: ["br"],
                              selfClosing: ['br'],
                           })}
                           </div>`,
               templates.HTML_CSS(PATH_STATIC_HOMECSS),
               templates.HTML_AUTHENTICATION(authentication));
            return resolve(response.send(htmlTemplate));
         }
      })
   });
}

exports.getRecords = function (tableName) {
   return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM ${tableName}`, (err, results, fields) => {
         return err ? reject(err) : resolve(results);
      });
   })
}

exports.create = function (request, response, authentication) {
   db.query(`SELECT * FROM ${TABLE_NAME_AUTH}`, (err, results) => {
      if (err) throw err;

      const tag = templates.HTML_SELECT_OPTION(results);

      let htmlTemplate = templates.HTML_TEMPLATE(`
      <h2>CREATE PAGE</h2>
      <form class="form_create" action="/page/process_create" method="post">
         <input type="text" name="title" placeholder="title"/>
         <select name="author"> ${tag} </select><br><br>
         <textarea name="desc" placeholder="desc"></textarea><br><br>
         <input type="submit" value="submit"/>
      </form>
      `, templates.HTML_CSS(PATH_STATIC_HOMECSS),
         templates.HTML_AUTHENTICATION(authentication));
      response.send(htmlTemplate);
   })
}

exports.process_create = function (request, response) {
   // 1. body-parser를 이용하여 구현
   const post = request.body;
   let title = post.title;
   let desc = post.desc;
   let author = post.author;

   db.query(`INSERT INTO ${TABLE_NAME_MAIN} (title, description, created, author_id)
            VALUES (?, ?, NOW(), ?)`, [title, desc, author], (err, results) => {
      if (err) throw err;
      /* 
         npm mysql 라이브러리의 설명서에 따르면, AUTO INCREMENT한 Primary key를 가진 row를 삽입했을 때
         results의 insertId 변수를 통해 그 id 값을 가져올 수 있다고 한다.
      */
      response.redirect(`/page/${results.insertId}`);
   });

   // 2. body-parser를 이용하지 않고 구현
   // let body = '';

   // request.on('err', (err) => {
   //    console.log(err);
   // }).on('data', (chunk) => {
   //    body += chunk;
   // }).on('end', () => {
   //    response.on('err', (err) => {
   //       console.log(err);
   //    })

   //    let post = qs.parse(body);
   //    let title = post.title;
   //    let desc = post.desc;
   //    let author = post.author;

   //    db.query(`INSERT INTO ${TABLE_NAME_MAIN} (title, description, created, author_id)
   //          VALUES (?, ?, NOW(), ?)`, [title, desc, author], (err, results) => {
   //       if (err) throw err;
   //       /* 
   //          npm mysql 라이브러리의 설명서에 따르면, AUTO INCREMENT한 Primary key를 가진 row를 삽입했을 때
   //          results의 insertId 변수를 통해 그 id 값을 가져올 수 있다고 한다.
   //       */
   //       response.redirect(`/page/${results.insertId}`);
   //    });
   // });
}

exports.update = function (request, response, authentication) {
   const tableID = request.params.table_main_id;
   const filteredID = path.parse(tableID).base;

   db.query(`SELECT * FROM ${TABLE_NAME_MAIN} WHERE id=?`, [filteredID], (err, results_main) => {
      if (err) throw err;

      db.query(`SELECT * FROM author`, (err, results_auth) => {
         if (err) throw err;

         const tag = templates.HTML_SELECT_OPTION(results_auth, results_main[0].author_id);

         let htmlTemplate = templates.HTML_TEMPLATE(`
            <h3>UPDATE (${sanitizeHTML(results_main[0].title)})</h3>
            <form class="form_update" action="/page/process_update" method="post">
               <input type="hidden" name="id" value="${sanitizeHTML(results_main[0].id)}" />
               <input type="text" name="title" value="${sanitizeHTML(results_main[0].title)}"/>
               <select name="author" disabled> ${tag} </select><br><br>
               <textarea name="desc">${sanitizeHTML(results_main[0].description)}</textarea><br><br>
               <input type="submit" value="submit"/>
            </form>
         `, templates.HTML_CSS(PATH_STATIC_HOMECSS),
            templates.HTML_AUTHENTICATION(authentication));
         response.send(htmlTemplate);
      })
   })
}

exports.process_update = function (request, response) {
   let post = request.body;
   let id = post.id;
   let title = post.title;
   let desc = post.desc;

   db.query(`UPDATE ${TABLE_NAME_MAIN} SET title=?, description=? WHERE id=?`,
      [title, desc, id], (err, results) => {
         if (err) throw err;

         response.redirect(`/page/${id}`);
      })
}

exports.delete = function (request, response, authentication) {
   const tableID = request.params.table_main_id;
   const filteredID = path.parse(tableID).base;

   db.query(`SELECT * FROM ${TABLE_NAME_MAIN} WHERE id=?`, [filteredID], (err, results) => {
      let htmlTemplate = templates.HTML_TEMPLATE(`
      <h3>${sanitizeHTML(results[0].title)} - DELETE PAGE</h3>
      <form class="form_delete" action="/page/process_delete" method="post">
         <input type="hidden" name="id" value="${sanitizeHTML(results[0].id)}"/><br><br>
         <input type="submit" value="delete"/>
      </form>
      `, templates.HTML_CSS(PATH_STATIC_HOMECSS),
         templates.HTML_AUTHENTICATION(authentication));
      response.send(htmlTemplate);
   })
}

exports.process_delete = function (request, response) {
   let post = request.body;
   let id = post.id;

   db.query(`DELETE FROM ${TABLE_NAME_MAIN} WHERE id=?`, [id], (err, results) => {
      if (err) throw err;

      response.redirect(`/`);
   })
}