let checkAdmin = (req, res, next) => {
    let user = req.user;
    if(user.username == "admin") return next();
    if (!(user.role == "admin")) {
        req.flash('error', 'You must be an admin to access this page');
        return res.redirect('/login');
    }
    return next();
}

export default checkAdmin;