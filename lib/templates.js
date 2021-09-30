const sanitizeHTML = require('sanitize-html');

module.exports = {
   HTML_TEMPLATE: (block, styleSheets = '', authentication = '') => {
      return (`<!DOCTYPE html>
   <html lang="ko">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Index</title>
      ${styleSheets}
   </head>

   <body class="bgimg">
      <h1> WELLCOME TO EGYPT </h1>
      ${authentication}
      <h2><a href="/"> TO HOME </a> </h2>
      <a href="/page/create">create</a>
      <a href="/author">authors</a>
      ${block}
      <div class="div_block">
      <p></p>
      </div>
   </body>
   </html> `);
   },
   HTML_CSS: (link) => {
      return (`
         <link rel = "stylesheet" href = "${link}" />
            `);
   },
   HTML_LIST: (dbList) => {
      let list = '<ul>';

      for (let i = 0; i < dbList.length; i++) {
         if (dbList[i] === "HOME") continue;
         list += `<li> <a href="/page/${dbList[i].id}">${dbList[i].title}</a></li> `;
      }
      list += "</ul>";

      return list;
   },
   HTML_SELECT_OPTION: (arrayAuth, id = 0) => {
      let tag_main = ``;
      arrayAuth.forEach(e => {
         let tag_selected = '';
         if (id === e.id) {
            tag_selected = ' selected';
         }
         tag_main += `<option value = "${e.id}"${tag_selected}> ${sanitizeHTML(e.name)}</option> `;
      })

      return tag_main;
   },
   HTML_AUTH_TABLE: (arrayAuth, cssOption) => {
      let tag_main = `<table> `;

      arrayAuth.forEach(e => {
         tag_main += `<tr>
            <td>${sanitizeHTML(e.id)}</td>
            <td>${sanitizeHTML(e.name)}</td>
            <td>${sanitizeHTML(e.profile)}</td>
            <td><a href="/author/update?author_id=${e.id}">update</a></td>
            <td>
            <form id="auth_form_del" action="/author/process_delete" method="POST">
               <input type="hidden" name="author_id" value=${sanitizeHTML(e.id)} />
               <input type="submit" value="delete" />
            </form>
            </td>
         </tr > `;
      });

      tag_main += `</table > ${cssOption} `;

      return tag_main;
   },
   HTML_AUTHENTICATION: (authentication) => {
      if (!authentication) return '<a href="/login">LogIn</a>'
      else return '<a href="/login/process_logout">LogOut</a>'
   }
};