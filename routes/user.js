import express from 'express';
import User from '../models/User.js';
import passport from 'passport';
import crypto from 'crypto';
import querystring from 'querystring';
import axios from 'axios';
import dotenv from 'dotenv';
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import CatchAsync from '../utils/CatchAsync.js';
import world_universities from '../public/assets/json/world-universities.json' assert { type: 'json' };
import sendEmail from '../utils/sendEmail2.js';
import Counselor from '../models/Counselor.js';
import Stripe from 'stripe';
import checkCounselor from '../utils/checkCounselor.js';


if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}



//stripe auth config
const stripe_key = process.env.STRIPE_API_KEY;
const stripe_refresh_url = process.env.STRIPE_REFRESH_URL;
const stripe_return_url = process.env.STRIPE_RETURN_URL;

var stripe = Stripe(stripe_key)



//start express router
const router = express.Router();


//Register page 
router.get('/register', function (req, res) {
    res.render('user/register');
})



//Register post route
router.post('/register', CatchAsync(async (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let username = req.body.username;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let profile_picture = await fetch('https://ui-avatars.com/api/?name=' + firstName + "+" + lastName + '&size=128');
        let password_reset_token = crypto.randomBytes(20).toString('hex');
        profile_picture = profile_picture.url;

        let user = new User({ email, username, firstName, lastName, profile_picture, password_reset_token });
        try {
            await User.register(user, password)
        } catch (e) {
            req.flash('error', "This Email or Username Already Exists!");
            return res.redirect('/register');
        }
        sendEmail(email, 'Welcome to Counsia', 'register.html', {});



        //login for me
        passport.authenticate('local')(req, res, function () {
            return res.redirect('/success');
        });
    }
    catch (e) {
        console.log(e);
        req.flash('error', "Something Went Wrong");
        return res.redirect('/register');
    }


}))


//Login page
router.get('/login', function (req, res) {
    res.render('user/login');
})


//Login post roite
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    res.redirect(req.session.returnTo || '/dashboard');
    console.log(req.session)
    delete req.session.returnTo;


})

router.get('/success', checkedLoggedIn, function (req, res) {
    res.render('user/success');
}
);


//Logout
router.get('/logout', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        req.logout(
            function (err) {
                if (err) {
                    req.flash('error', "Something went wrong");
                    res.redirect('/');
                } else {
                    req.flash('success', 'Goodbye!');
                    res.redirect('/login');
                }
            }

        );
    }
    catch (e) {
        console.log(e);
        req.flash('error', "Something went wrong");
        res.redirect('/');
    }

}));


//possword reset page
router.get('/password-reset', async (req, res) => {
    res.render('user/password-reset');
})


//password reset post route
router.post('/password-reset', CatchAsync(async (req, res) => {
    try {
        let email = req.body.email;
        let user = '';
        try {
            user = await User.find({ email: email });
            user = user[0];
            if (!user) {
                throw new Error('No account with this email');
            }
        }

        catch (e) {
            console.log(e);
            req.flash('error', 'No account with this email');
            return res.redirect('/password-reset');
        }
        let token = user.password_reset_token;

        let link = req.protocol + '://' + req.get('host') + "/password-reset/" + token + "/" + user._id;



        sendEmail(user.email, 'Counsia Password Reset', 'password_reset.html', { link: link, username: user.username });

        req.flash('success', 'Password reset instructions sent to your email');
        return res.redirect('/login');
    }
    catch (e) {
        console.log(e);
        req.flash('error', 'Something went wrong');
        return res.redirect('/password-reset');
    }
}))


//password reset page
router.get('/password-reset/:token/:id', CatchAsync(async (req, res) => {
    try {
        let token = req.params.token;
        let id = req.params.id;

        let user = await User.findById(id);
        if (user.password_reset_token == token) {
            return res.render('user/password-reset-form', { user });
        }
        else {
            req.flash('error', 'Invalid token');
            return res.redirect('/');
        }
    } catch {
        req.flash('error', 'Invalid token');
        return res.redirect('/');
    }

}))


//password reset post route
router.post('/password-reset/:token/:id', CatchAsync(async (req, res) => {
    try {
        let token = req.params.token;
        let id = req.params.id;
        let user = await User.findById(id);
        if (user.password_reset_token == token) {
            let password = req.body.password;
            let password_confirm = req.body.password_confirm;
            if (password != password_confirm) {
                req.flash('error', 'Passwords do not match');
                console.log('Passwords do not match')

                return res.redirect('/password-reset/' + token + '/' + id);
            }
            else {
                await user.setPassword(password);
                user.password_reset_token = crypto.randomBytes(20).toString('hex');
                await user.save();
                req.flash('success', 'Password reset successfully');
                console.log('Password reset successfully')
                return res.redirect('/login');
            }
        }
        else {
            req.flash('error', 'Invalid token');
            return res.redirect('/');
        }
    }
    catch (e) {
        req.flash('error', 'Invalid token');
        return res.redirect('/');
    }
}))


//user profile update from dashboard
router.post('/user/:id/info/update', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let email = req.body.email;
        let SAT = req.body.SAT;
        let ACT = req.body.ACT;
        let gpa = req.body.gpa;
        let bio = req.body.bio;
        let interested_universities = req.body.interested_universities;
        let major = req.body.major;

        user.SAT = SAT;
        user.ACT = ACT;
        user.gpa = gpa;
        user.bio = bio;
        user.interested_universities = interested_universities;
        user.major = major;
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        await user.save();
        req.flash('success', 'Information updated');
        console.log('Information updated')
        return res.redirect('/dashboard');
    } catch (e) {
        req.flash('error', "This Email Already Exists! Try A Different One");
        return res.redirect('/dashboard');
    }

}))







router.get('/user/:id', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        res.render('user/profile', { user });
    } catch (e) {
        req.flash('error', 'Something went wrong');
        return res.redirect('/dashboard');
    }
}
));


router.get('/delete-account', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        res.render('user/delete-account');

    }
    catch (e) {
        req.flash('error', 'Something went wrong');
        return res.redirect('/dashboard');
    }
}
));


router.post('/delete-account', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = await User.findById(req.user._id).populate('meetings').populate('counselor');
        let confirm_user = req.body.username;


        if (user.username != confirm_user) {
            req.flash('error', 'Username does not match');
            return res.redirect('/delete-account');
        }

        //only delete if no upcoming meetings as a user or counselor
        let meetings = user.meetings;
        let counselor = null;
        if (user.counselor != null) {
            counselor = await Counselor.findById(user.counselor._id).populate('meetings');
        }
        let upcoming_meetings = [];
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < meetings.length; i++) {
            let meeting = meetings[i];
            let meeting_date = meeting.start;
            if (meeting_date >= today) {
                upcoming_meetings.push(meeting);
            }
        }

        let upcoming_counselor_meetings = [];
        if (counselor != null) {
            for (let i = 0; i < counselor.meetings.length; i++) {
                let meeting = counselor.meetings[i];
                let meeting_date = new Date(meeting.start);
                if (meeting_date >= today) {
                    upcoming_counselor_meetings.push(meeting);
                }
            }

        }
        if (upcoming_meetings.length > 0 || upcoming_counselor_meetings.length > 0) {
            req.flash('error', 'You cannot delete your account if you have upcoming meetings. Please cancel your upcoming meetings and try again.');
            return res.redirect('/delete-account');
        }
        else {


            //change username to "DeletedAccount" + random number
            let random_number = Math.floor(Math.random() * 1000000000000);
            user.username = 'DeletedAccount' + random_number;
            let original_email = user.email;
            //change email to "DeletedAccount" + random number
            user.email = 'DeletedAccount' + random_number + '@counsia.com';

            await user.save();

            //set counselor events to null
            if (counselor != null) {
                counselor.events = [];
                await counselor.save();
            }
            //save user

            //logout 


            req.flash('success', 'Account deleted successfully');
            sendEmail(original_email, 'Counsia Account Deleted', 'account_deleted.html', {});

            req.logout(
                function (err) {
                    if (err) {
                        req.flash('error', "Something went wrong");
                        res.redirect('/');
                    } else {
                        req.flash('success', 'Account deleted successfully');
                        res.redirect('/');
                    }
                }
            );




        }
    }
    catch (e) {
        req.flash('error', 'Something went wrong');
        console.log(e);
        return res.redirect('/dashboard');
    }
}
));

router.get('/auth/stripe', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let counselor = await Counselor.findById(req.user.counselor);
        let counselor_stripe_id = counselor.stripe_id;

        if (counselor_stripe_id != "") {
            console.log('runnin')

            let retrieved_account = await stripe.accounts.retrieve(
                counselor_stripe_id
            );
            if (retrieved_account.charges_enabled) {
                return res.redirect('dashboard/counselor-update');

            }
        }


        const account = await stripe.accounts.create({
            country: 'US',
            type: 'express',
            capabilities: {
                card_payments: {
                    requested: true,
                },
                transfers: {
                    requested: true,
                },
                tax_reporting_us_1099_k: {
                    requested: true,
                }
            },
            business_type: 'individual',
            business_profile: {
                url: 'https://counsia.com/counselor/' + counselor._id,
            },
        });
        let account_id = account.id;

        const accountLink = await stripe.accountLinks.create({
            account: account_id,
            refresh_url: stripe_refresh_url,
            return_url: stripe_return_url,
            type: 'account_onboarding',
        });

        counselor.stripe_id = account_id;
        await counselor.save();

        return res.redirect(accountLink.url);

    }
    catch (e) {
        console.log(e);
        req.flash('error', 'Something went wrong');
        return res.redirect('/dashboard/counselor-update');
    }


}));


router.get('/auth/stripe/success', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let account_id = await Counselor.findById(req.user.counselor).stripe_id;
        if (account_id == "") {
            req.flash('error', 'Something went wrong');
            return res.redirect('/dashboard/counselor-update');
        }

        let account = await stripe.accounts.retrieve(
            account_id
        );

        let charges_enabled = account.charges_enabled;


        res.render('user/stripe-success', { charges_enabled });
    }
    catch (e) {
        console.log(e);
        req.flash('error', 'Something went wrong');
        return res.redirect('/dashboard/counselor-update');
    }

}));


router.get('/mentor', CatchAsync(async (req, res) => {
    res.render('misc/mentor');

}));











export default router;


