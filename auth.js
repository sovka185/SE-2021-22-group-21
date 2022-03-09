// check if is LoggedIn
exports.loginRequired = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('message', 'Please login!')
    res.redirect("/user/login");
}

exports.adminLoginRequired = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('message', 'Please login!')
    res.redirect("/admin/login");
}

