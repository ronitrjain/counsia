import world_universities from '../public/assets/json/world-universities.json' assert { type: 'json' };
import college_data from '../public/assets/json/college-data.json' assert { type: 'json' };

import express from 'express';
import User from '../models/User.js';
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import CatchAsync from '../utils/CatchAsync.js';
import Meeting from '../models/Meeting.js';
import Counselor from '../models/Counselor.js';
import checkCounselor from '../utils/checkCounselor.js';
import getActive from '../utils/getActive.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';



//dot env if not production
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const stripe = Stripe(process.env.STRIPE_API_KEY);


const router = express.Router();





router.get('/security/', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        console.log('security')
        let user = req.user;
        user = await User.findById(user._id).populate({
            path: 'meetings',
            populate: {
                path: 'counselor',
                model: 'Counselor' // Replace 'Counselor' with the actual model name for your counselor if it's different
            }
        });
        const upcoming_meetings = user.meetings.filter(meeting => new Date(meeting.start) > new Date());
        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);
        res.render('dashboard-v2/user_security', { upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'security' });

    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));






router.get('/upcoming', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        user = await User.findById(user._id).populate({
            path: 'meetings',
            populate: {
                path: 'counselor',
                model: 'Counselor' // Replace 'Counselor' with the actual model name for your counselor if it's different
            }
        });
        const upcoming_meetings = user.meetings.filter(meeting => new Date(meeting.start) > new Date());

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        res.render('dashboard-v2/user_upcoming', { upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'upcoming' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));

router.get('/past', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        user = await User.findById(user._id).populate({
            path: 'meetings',
            populate: {
                path: 'counselor',
                model: 'Counselor' // Replace 'Counselor' with the actual model name for your counselor if it's different
            }
        });
        const upcoming_meetings = user.meetings.filter(meeting => new Date(meeting.start) > new Date());
        const past_meetings = user.meetings.filter(meeting => new Date(meeting.start) < new Date());


        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        res.render('dashboard-v2/user_past', { upcoming_meetings, past_meetings, world_universities, popular_counselors, getActive, thisPage: 'past' });

    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));




router.get('/counselor', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        user = await User.findById(user._id).populate({
            path: 'meetings',
            populate: {
                path: 'counselor',
                model: 'Counselor' // Replace 'Counselor' with the actual model name for your counselor if it's different
            }
        })

        let payments = await Payment.find({ counselor: user.counselor }).populate('user')


        const upcoming_meetings = user.meetings.filter(meeting => new Date(meeting.start) > new Date());




        let counselor_upcoming_meetings = await Meeting.find({
            counselor: user.counselor,
            start: { $gt: new Date() } // Filter for meetings with a start date after the current date
        })
            .limit(3)
            .populate('counselor')
            .populate('user');

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        //get last 7 days of week 
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const getLast7Days = () => {
            const today = new Date();
            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const currentDate = new Date(today);
                currentDate.setDate(today.getDate() - i);
                const dayName = daysOfWeek[currentDate.getDay()];
                last7Days.push(` "${dayName}"`);
            }

            return last7Days;
        };

        const last7DaysNames = getLast7Days();


        //get payment amounts for last 7 days
        let paymentsLast7Days = [];
        for (let i = 6; i >= 0; i--) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - i);
            const dayName = daysOfWeek[currentDate.getDay()];
            let payments_this_week = payments.filter(payment => payment.date.getDay() == currentDate.getDay());
            let total = 0;
            payments_this_week.forEach(payment => {
                total += payment.amount;
            })
            paymentsLast7Days.push(total);
        }

        console.log(paymentsLast7Days)
        console.log(last7DaysNames)
        console.log(counselor_upcoming_meetings)






        res.render('dashboard-v2/counselor_profile', { last7DaysNames, paymentsLast7Days, upcoming_meetings, payments, counselor_upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'counselor-personal' });
    }

    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));







router.get('/payments', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        user = await User.findById(user._id).populate({
            path: 'meetings',
            populate: {
                path: 'counselor',
                model: 'Counselor' // Replace 'Counselor' with the actual model name for your counselor if it's different
            }
        }).populate('payments');
        const upcoming_meetings = user.meetings.filter(meeting => new Date(meeting.start) > new Date());
        let refunds = await Refund.find({ user: user._id }).populate('counselor').populate('user');
        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);
        let payments = user.payments


        res.render('dashboard-v2/user_payments', { upcoming_meetings, payments, refunds, world_universities, popular_counselors, getActive, thisPage: 'payments' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));


router.get('/counselor-upcoming', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        user = await User.findById(user._id).populate({
            path: 'meetings',
            populate: {
                path: 'counselor',
                model: 'Counselor' // Replace 'Counselor' with the actual model name for your counselor if it's different
            }
        });
        const upcoming_meetings = user.meetings.filter(meeting => new Date(meeting.start) > new Date());
        let counselor_upcoming_meetings = await Meeting.find({ counselor: user.counselor }).populate('counselor').populate('user');
        counselor_upcoming_meetings = counselor_upcoming_meetings.filter(meeting => new Date(meeting.start) > new Date());


        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        res.render('dashboard-v2/counselor_upcoming', { upcoming_meetings, counselor_upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'counselor-upcoming' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));

router.get('/counselor-past', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        user = await User.findById(user._id).populate({
            path: 'meetings',
            populate: {
                path: 'counselor',
                model: 'Counselor' // Replace 'Counselor' with the actual model name for your counselor if it's different
            }
        });
        const upcoming_meetings = user.meetings.filter(meeting => new Date(meeting.start) > new Date());
        let counselor_upcoming_meetings = await Meeting.find({ counselor: user.counselor, start: { $lte: new Date() } }).populate('counselor').populate('user');


        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        res.render('dashboard-v2/counselor_past', { upcoming_meetings, counselor_upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'counselor-past' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));



router.get('/counselor-payments', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let upcoming_meetings = await Meeting.find({ user: user._id, start: { $gte: new Date() } }).populate('counselor').populate('user');

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);
        let payments = await Payment.find({ counselor: user.counselor }).populate('counselor').populate('user');

        let refunds = await Refund.find({ counselor: user.counselor }).populate('counselor').populate('user');


        res.render('dashboard-v2/user_payments', { upcoming_meetings, payments, refunds, world_universities, popular_counselors, getActive, thisPage: 'counselor-payments' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));









router.get('/', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let upcoming_meetings = await Meeting.find({ user: user._id, start: { $gte: new Date() } }).populate('counselor').populate('user');

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        res.render('dashboard-v2/user_profile', { upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'personal' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));


router.get('/interested_universities', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let upcoming_meetings = await Meeting.find({ user: user._id, start: { $gte: new Date() } }).populate('counselor').populate('user');

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        let interested_universities = user.interested_universities;

        let interested_universities_data = [];
        interested_universities.forEach(university => {
            let university_data = college_data[university];
            if (university_data != undefined) university_data['name'] = university;
            if (university_data != undefined && university_data.Acceptance_Rate != undefined) {
                university_data['Acceptance_Rate_Num'] = Number(university_data.Acceptance_Rate.split('%')[0])

            }
            interested_universities_data.push(university_data);
            console.log(university_data)
        })

        //

        res.render('dashboard-v2/user_interested_universities', { upcoming_meetings, world_universities, popular_counselors, interested_universities_data, getActive, thisPage: 'interested_universities' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));



router.get('/counselor-schedule', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {

    try {
        let user = req.user;
        let upcoming_meetings = await Meeting.find({ user: user._id, start: { $gte: new Date() } }).populate('counselor').populate('user');

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

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

        res.render('dashboard-v2/counselor_schedule', { counselor, upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'counselor-schedule' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));

router.get('/counselor-update', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {
    try {

        let user = req.user;
        let upcoming_meetings = await Meeting.find({ user: user._id, start: { $gte: new Date() } }).populate('counselor').populate('user');

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);
        let counselor = await Counselor.findOne({ user: user._id });

        let stripe_verified = false;
        if (counselor.stripe_id != "") {

            let stripe_account = await stripe.accounts.retrieve(counselor.stripe_id);
            stripe_verified = stripe_account.charges_enabled;
        }

        res.render('dashboard-v2/counselor_update', { counselor, stripe_verified, upcoming_meetings, world_universities, popular_counselors, getActive, thisPage: 'update' });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }

}));

router.get('/schedule', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let upcoming_meetings = await Meeting.find({ user: user._id, start: { $gte: new Date() } }).populate('counselor').populate('user');

        //get popular counselors

        let popular_counselors = await Counselor.find({}).sort({ views: -1 }).limit(3);

        user = await User.findById(user._id).populate('meetings');

        let events = [];

        user.meetings.forEach(meeting => {
            let event = {
                title: meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1,) + ' Meeting ',
                start: meeting.start,
                end: meeting.end,
                backgroundColor: "#4A7AF5",
                borderColor: "#4A7AF5",
                textColor: "#FFFFFF",
                id: meeting._id
            }
            events.push(event);
        })






        res.render('dashboard-v2/user_schedule', { upcoming_meetings, world_universities, events, popular_counselors, getActive, thisPage: 'schedule' });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));








//add new routes for dashboard 2

export default router;

