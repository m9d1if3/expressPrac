exports.isLoggedIn = function (request, response) {
   //console.log(request.cookies.user_data);
   return request.cookies.user_data ? true : false;
};

exports.isAdmin = function (request, response) {
   return (request.cookies.user_data.email === 'admin@gmail.com') ? true : false;
}