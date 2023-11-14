
let hasApplied = async (req, res, next) => {
    let user = req.user;
    if (user.counselor_status == "unverified") {
        return next();
    }
    else {
        req.flash('error', 'You have already applied');
        return res.redirect('/dashboard/counselor');
    }
}

export default hasApplied;