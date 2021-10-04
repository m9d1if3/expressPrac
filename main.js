const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const topicRouter = require('./routes/pages');
const loginRouter = require('./routes/login');
const path = require('path');
const table_main = require('./lib/main_table');
const table_author = require('./lib/author_table');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fileStore = require('session-file-store')(session);

const TABLE_NAME_MAIN = 'topic';
const TABLE_NAME_AUTH = 'author';

app.use(helmet());

/*
   < 정적(static) 파일의 사용 >

   express.static(root, [options])
   : express 내장 미들웨어인 static을 이용
   : root 인자는 static 파일들이 담긴 root 폴더를 가르킨다.
*/
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static('public'));

/*
   < Third-party 미들웨어, Body-parser와 Compression의 사용>

   1. Body-parser
   : 클라이언트 측에서 get, post로 보낸 정보를 파싱하여
   req에 body라는 프로퍼티를 만들고 정보를 담아 보낸다.

   : next()에 의해 호출된 미들웨어에서는 req.body 프로퍼티를 통해 해당 데이터에 접근이 가능하다.

   2. Compression
   : 클라이언트 측에서 get, post로 보낸 정보를 자동으로 압축해주는 미들웨어.
*/
// express에 내장된 body-parser라는 middle-ware를 사용한다고 알림
app.use(express.urlencoded({
   limit: '50mb',
   extended: false
}));

// compression, cookie-parser라는 middle-ware를 사용한다고 알림
app.use(compression());
app.use(cookieParser());
app.use(session({
   secret: 'session secret',
   resave: false,
   saveUninitialized: true,
   store: new fileStore({logFn: function(){}}),
}));

/*
   < application-level 커스텀 미들웨어 구현 >

   : use는 모든 request에 대해 작동하도록 설정.
   : use 대신 get/post을 쓰면 get/post 방식으로 온 request에 대해서만 작동하도록 설정.
   
   : 첫번째 인자로 데이터를 받을 경로를 받는다.
      => 이 경로에 미들웨어 함수가 mount 된다고 한다.
   : 두번째 인자로 미들웨어 함수를 받는다.
         => 미들웨어 함수는 인자로 req, res, next를 받는다.
         => next는 다음에 호출될 미들웨어를 가르킨다.
      *  => 여러개의 미들웨어 함수를 인자로 줄 수 있다. 각 미들웨어 함수는 next()를 통해 순차적으로 실행된다.
            ex) app.use('/', 
               function(req, res, next){ console.log('first'); next(); },
               function(req, res, next){ console.log('second'); next(); }
            )
   : records를 비동기적으로 받아온 후, req에 tableRecords라는 프로퍼티를 만들어 해당 데이터를 담아 보낸다.
     
   : next()를 만나면, 해당 경로와 일치하는 routing 미들웨어로 넘어간다.
       => next()에 의해 호출된 미들웨어에서는 req.tableRecords 프로퍼티를 통해 해당 데이터에 접근이 가능하다.
   
   : next()를 쓰지 않으면, 현재 미들웨어 함수에서만 들어온 요청을 처리하고 끝난다.
*/
/*
   < application-level 미들웨어의 실행 흐름 제어 >
   
   ex) app.get('/user/:id', function(req, res, next) {
         if( req.params.id === 0 ) next('route');
         else next();
      }, function(req, res, next) {
         res.render('regular');
      })

      app.get('/user/:id', function(req, res, next) {
         res.render('special');
      })

   => id가 0이면, next('route')에 의해 경로가 같은 다음 라우트로 넘어간다.       // 'special'를 render
   => id가 0이 아니면, next()에 의해 다음 미들웨어 함수가 실행된다.              // 'regular'를 render

   * => 단, next('route')는 app.METHOD() or router.METHOD()에 의해 로드된 미들웨어 함수 안에서만 작동한다.
*/

app.get('*', async (req, res, next) => {
   try {
      const records = await table_main.getRecords(TABLE_NAME_MAIN);
      req.tableRecords = records;
   } catch (err) {
      next(err);
   }
   next();
});

app.use('/', indexRouter);
app.use('/page', topicRouter);
app.use('/login', loginRouter);

// Not Found process middle-ware
app.use(function (req, res, next) {
   res.status(404).send('ERROR 404');
});

// Error process middle-ware
app.use(function (err, req, res, next) {
   console.error(err.stack);
   res.status(500).send('ERROR 500');
});

app.listen(3000, () => {
   console.log('App listening on port 3000')
});