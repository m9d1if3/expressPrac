const templates = require('./templates');
const sanitizeHTML = require('sanitize-html');
const PATH_STATIC_HOMECSS = '/css/home.css';

const loginData = {
   id: 'admin',
   pwd: '1111',
   nickname: 'admmmmmmmin',
}

exports.login = function (request, response, authentication) {
   const title = 'LOG-IN page';

   let htmlTemplate = templates.HTML_TEMPLATE(`
                     <h1> 
                     ${sanitizeHTML(title)}
                     </h1>
                     <div class="div_login">
                        <form class="form_login" action='/login/process' method='post'>
                           <input type='text' name='id' placeholder='id' />
                           <input type='password' name='pwd' placeholder='password' />
                           <input type='submit' value='login' />
                        </form>
                     </div>
                     `, templates.HTML_CSS(PATH_STATIC_HOMECSS),
      templates.HTML_AUTHENTICATION(authentication));
   response.send(htmlTemplate);
}

exports.process_login = function (request, response) {
   const post = request.body;
   const id = post.id;
   const password = post.pwd;

   //session 인증 로그인
   if (id === loginData.id && password === loginData.pwd) {
      request.session.isLogin = true;
      request.session.nickname = loginData.nickname;

      // 위에 설정한 값들을 세션 스토어에 반영하는 작업을 시작하게 함
      // save 함수를 실행하지 않으면, 세션 스토어에 저장도 하기전에 밑에있는 redirect가 실행되어 세션 정보가 제대로 반영되지 않는다.
      // 세션 스토어에 저장이 다 끝나면, callback 함수를 실행한다.
      request.session.save(() => {
         console.log('login successed..');
         response.redirect(`/`);
      });
   } else {
      console.log('login failed..');
      response.redirect(`/login`);
   }
}

exports.process_logout = function (request, response) {
   request.session.destroy((err) => {
      if (err) throw err;
      console.log('logout successed..');
      response.redirect(`/`);
   });
}