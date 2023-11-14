let checkedLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        req.session.returnTo = req.originalUrl;
        console.log("the session: " + req.session.returnTo);
        return res.redirect('/login');
    }
    return next();
}

export default checkedLoggedIn;