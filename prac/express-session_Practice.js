var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')
var fileStore = require('session-file-store')(session);

var app = express()

// session 미들웨어는 req 객체에 property로 session 객체를 추가해줌.
app.use(session({
   secret: 'keyboard cat',
   resave: false,
   saveUninitialized: true,
   // defalut로 현재 폴더 내 sessions 폴더에 자동으로 생성됨. 이는 옵션으로 설정 가능.
   store: new fileStore(),
}))

app.get('/', function (req, res, next) {

   // req.session 객체에 num 변수를 생성하여 값 할당이 가능하다.
   req.session.num === undefined ? req.session.num = 1 : ++req.session.num;
   console.log(req.session);
   res.send(`views: ${req.session.num} `)
})

app.listen(3000, () => {
   console.log('session prac app is listening on port 3000..');
})