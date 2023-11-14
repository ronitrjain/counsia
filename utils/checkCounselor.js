let checkCounselor = (req, res, next) => {
    let user = req.user;
    if (!(user.counselor_status == "verified")) {
        req.flash('error', 'You must be a counselor to access this page');
        return res.redirect('/login');
    }
    return next();
}

export default checkCounselor;