import express from 'express';
import Counselor from '../models/Counselor.js';
import Payment from '../models/Payment.js';
import Meeting from '../models/Meeting.js';
import formatTimeString from '../utils/formatTimeString.js';
import world_universities from '../public/assets/json/world-universities.json' assert { type: 'json' };


import CatchAsync from '../utils/CatchAsync.js';
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import checkCounselor from '../utils/checkCounselor.js';

//router
const router = express.Router();







//dashboard routes

//personal dashboard
router.get('/personal', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {

        let user = req.user;
        let counselor = null;
        if (user.counselor_status == "verified") {
            counselor = await Counselor.findOne({ user: user._id });

        }
        return res.render('user/dashboard/dashboard-personal', { user, counselor, world_universities });

    }


    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))




//security dashboard
router.get('/security', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = null;
        if (user.counselor_status == "verified") {
            counselor = await Counselor.findOne({ user: user._id });
        }



        return res.render('user/dashboard/dashboard-security', { user, counselor });


    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))

//personal dashboard
router.get('/', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {

        let user = req.user;
        let counselor = null;
        if (user.counselor_status == "verified") {
            counselor = await Counselor.findOne({ user: user._id });

        }
        return res.render('user/dashboard/dashboard-personal', { user, counselor, world_universities });

    }


    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))


//schedule dashboard
router.get('/counselor-schedule', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {

    try {
        let user = req.user;
        await Counselor.updateMany(
            {
                user: user._id,

                'events.start': { $lt: new Date() } // Filter events with a start time in the past
            },
            {
                $set: {
                    'events.$.backgroundColor': "#E7EAF3",

                }
            }
        );

        let counselor = await Counselor.findOne({ user: user._id });
        return res.render('counselor/dashboard/dashboard-counselor-schedule', { user, counselor });
    }

    catch (e) {
        console.log(e);
        return res.redirect('/');
    }

}))

//counselor schedule dashboard
router.post('/counselor-schedule', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = await Counselor.findOne({ user: user._id });
        counselor.events = JSON.parse(req.body.events);
        //sort events by start time
        counselor.events.sort(function (a, b) {
            return new Date(a.start) - new Date(b.start);
        });

        await counselor.save();
    }
    catch (e) {
        console.log(e);
        res.redirect('/');
    }


}));

//user payments dashboard
router.get('/payments', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = null;
        if (user.counselor_status == "verified") {
            counselor = await Counselor.findOne({ user: user._id });

        }
        let payments = await Payment.find({ user: user._id });
        return res.render('user/dashboard/dashboard-user-payments', { user, counselor, payments });


    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));


//upcoming meetings dashboard
router.get('/upcoming', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = null;
        if (user.counselor_status == "verified") {
            counselor = await Counselor.findOne({ user: user._id });
        }
        let meetings = await Meeting.find({ user: user._id }).populate('counselor').populate('user');


        //only upcoming meetings
        let now = new Date();
        meetings = meetings.filter((meeting) => new Date(meeting.start) > now);

        return res.render('user/dashboard/dashboard-upcoming', { user, counselor, meetings, formatTimeString });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}

));


//past meetings dashboard
router.get('/past', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = null;
        if (user.counselor_status == "verified") {
            counselor = await Counselor.findOne({ user: user._id });

        }
        let meetings = await Meeting.find({ user: user._id }).populate('counselor').populate('user');

        //only past meetings
        let now = new Date();
        meetings = meetings.filter((meeting) => new Date(meeting.start) < now);
        return res.render('user/dashboard/dashboard-past', { user, counselor, meetings, formatTimeString });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}

))



//counselor payments dashboard
router.get('/counselor-payments', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = await Counselor.findOne({ user: user._id });
        let payments = await Payment.find({ counselor: counselor._id });
        return res.render('counselor/dashboard/dashboard-counselor-payments', { user, counselor, payments });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}

));

//counselor personal dashboard
router.get('/counselor-personal', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = await Counselor.findOne({ user: user._id });
        return res.render('counselor/dashboard/dashboard-counselor-personal', { user, counselor });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }

}
));


//counselor past meetings
router.get('/counselor-past', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = await Counselor.findOne({ user: user._id });
        let meetings = await Meeting.find({ counselor: counselor._id }).populate('counselor').populate('user');

        //only past meetings
        let now = new Date();
        meetings = meetings.filter((meeting) => new Date(meeting.start) < now);
        return res.render('counselor/dashboard/dashboard-counselor-past', { user, counselor, meetings, formatTimeString });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }

}
));
//counselor upcoming meetings
router.get('/counselor-upcoming', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let counselor = await Counselor.findOne({ user: user._id });
        let meetings = await Meeting.find({ counselor: counselor._id }).populate('counselor').populate('user');

        //only past meetings
        let now = new Date();
        meetings = meetings.filter((meeting) => new Date(meeting.start) > now);
        return res.render('counselor/dashboard/dashboard-counselor-upcoming', { user, counselor, meetings, formatTimeString });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }

}
));





export default router;