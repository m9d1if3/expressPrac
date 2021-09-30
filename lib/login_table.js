const templates = require('./templates');
const sanitizeHTML = require('sanitize-html');
const PATH_STATIC_HOMECSS = '/css/home.css';


exports.login = function (request, response, authentication) {
   const title = 'LOG-IN page';

   let htmlTemplate = templates.HTML_TEMPLATE(`
                     <h1> 
                     ${sanitizeHTML(title)}
                     </h1>
                     <form action='/login/process' method='post'>
                     <p><input type='text' name='email' placeholder='email' /></p>
                     <p><input type='password' name='password' placeholder='password' /></p>
                     <p><input type='submit' value='login'/></p>
                     </form>
                     `, templates.HTML_CSS(PATH_STATIC_HOMECSS),
                     templates.HTML_AUTHENTICATION(authentication));
   response.send(htmlTemplate);
}

exports.process_login = function (request, response) {
   const post = request.body;
   const email = post.email;
   const password = post.password;

   if (email === 'admin@gmail.com' && password === '000000') {
      const userData = {
         email: email,
         password: password,
         nickname: 'admin',
      };
      response.cookie('user_data', userData, {
         maxAge: 1000 * 60 * 10,
      })
      response.redirect(`/`);
   } else {
      response.redirect(`/login`);
   }
}

exports.process_logout = function (request, response) {
   const userData = {
      email:'',
      password:'',
      nickname: '',
   };
   response.cookie('user_data', userData, {
      maxAge: 0,
   })
   response.redirect(`/`);
}