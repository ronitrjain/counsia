import express from 'express';
import Meeting from '../models/Meeting.js';
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import CatchAsync from '../utils/CatchAsync.js';
import checkAdmin from '../utils/checkAdmin.js';
import User from '../models/User.js';
import Counselor from '../models/Counselor.js';
import sendEmail from '../utils/sendEmail2.js';
import Refund from '../models/Refund.js';
import Payment from '../models/Payment.js';
import dotenv from 'dotenv';

//dot env if not production
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
//env variable cost
var cost = process.env.COST;

//start express router
const router = express.Router();

router.get('/all', async (req, res) => {
    //get all events from counselors
    let events = [];

    events = await Counselor.aggregate([
        {
            $unwind: "$events" // Unwind the 'events' array to create a separate document for each event
        },
        {
            $addFields: {
                "events.counselor_id": "$_id",
                "events.counselor_first_name": "$first_name", // Add counselor.first_name
                "events.counselor_last_name": "$last_name",  // Add counselor.last_name
                "events.current_university": "$current_university"  // Add counselor.current_university
            }
        },
        {
            $group: {
                _id: null,  // Group all the documents into a single group
                allEvents: { $push: "$events" } // Push the 'events' into a new array called 'allEvents'
            }
        }
    ])

    console.log(events[0]);

    events = events[0].allEvents.filter(event => event.extendedProps.isBooked == false);

    for(let i =0; i<events.length; i++){
        events[i].title = events[i].counselor_first_name + " " + events[i].counselor_last_name + " - " + events[i].current_university;
    }

    return res.render('meeting/all_meetings', { events });
});

router.get('/form/:id', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {

        let user = req.user;
        let meeting = await Meeting.findById(req.params.id).populate('counselor').populate('user');
        if (meeting.user._id.toString() != user._id.toString()) {
            return res.redirect('/dashboard');
        }

        return res.render('meeting/meeting_form', { meeting });

    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }


}))

router.post('/form/:id', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let meeting = await Meeting.findById(req.params.id).populate('counselor').populate('user');
        if (meeting.user._id.toString() != user._id.toString()) {
            console.log("not authorized")
            return res.redirect('/');
        }
        meeting.type = req.body.type;
        meeting.student_first_name = req.body.student_first_name;
        meeting.student_last_name = req.body.student_last_name;
        meeting.student_email = req.body.student_email;
        meeting.student_comments = req.body.student_comments;
        console.log(meeting);
        await meeting.save();
        let date = new Date(meeting.start).toDateString();
        let time = new Date(meeting.start).toTimeString();
        switch (meeting.type) {
            case "essay":
                sendEmail(meeting.counselor.email_address, "Essay Meeting Confirmation", "essay_meeting.html", { name: meeting.user.firstName + " " + meeting.user.lastName, meeting_date: date, meeting_time: time, zoom_meeting_link: meeting.zoom_meeting_link, email: meeting.user.email });
                sendEmail(meeting.user.email, "Essay Meeting Confirmation", "essay_meeting.html", { name: meeting.counselor.first_name + " " + meeting.counselor.last_name, meeting_date: date, meeting_time: time, zoom_meeting_link: meeting.zoom_meeting_link, email: meeting.counselor.email_address });
                break
            case "interview":
                sendEmail(meeting.counselor.email_address, "Interview Prep Meeting Confirmation", "interview_meeting.html", { name: meeting.user.firstName + " " + meeting.user.lastName, meeting_date: date, meeting_time: time, zoom_meeting_link: meeting.zoom_meeting_link, email: meeting.user.email });
                sendEmail(meeting.user.email, "Interview Prep Meeting Confirmation", "interview_meeting.html", { name: meeting.counselor.first_name + " " + meeting.counselor.last_name, meeting_date: date, meeting_time: time, zoom_meeting_link: meeting.zoom_meeting_link, email: meeting.counselor.email_address });
                break
            case "strategy":
                sendEmail(meeting.counselor.email_address, "Strategy Meeting Confirmation", "strategy_meeting.html", { name: meeting.user.firstName + " " + meeting.user.lastName, meeting_date: date, meeting_time: time, zoom_meeting_link: meeting.zoom_meeting_link, email: meeting.user.email });
                sendEmail(meeting.user.email, "Strategy Meeting Confirmation", "strategy_meeting.html", { name: meeting.counselor.first_name + " " + meeting.counselor.last_name, meeting_date: date, meeting_time: time, zoom_meeting_link: meeting.zoom_meeting_link, email: meeting.counselor.email_address });
                break
        }

        return res.redirect('/meeting/' + meeting._id); //redirect to meeting view page');

    } catch (e) {
        console.log(e);
        return res.redirect('/dashboard');
    }
}))


router.get('/:id', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let meeting = await Meeting.findById(req.params.id).populate('counselor').populate('user');

        return res.render('meeting/meeting_view', { meeting });

    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))


router.get('/delete/:id', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let meeting = await Meeting.findById(req.params.id).populate('counselor').populate('user');
        //if meeting.start is less than current date, cannot delete
        if (new Date(meeting.start) < new Date() - 1000 * 60 * 12) {
            return res.redirect('/dashboard');
        }
        if (meeting.user._id.toString() != user._id.toString() && user.counselor.toString() != meeting.counselor._id.toString()) {
            return res.redirect('/');
        }
        return res.render('meeting/meeting_delete', { meeting });
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
))

router.post('/delete/:id', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let reason = req.body.reason;
        let meeting = await Meeting.findById(req.params.id).populate('counselor').populate('user');
        if (new Date(meeting.start) < new Date() - 1000 * 60 * 12) {
            return res.redirect('/dashboard');
        }
        if (meeting.user._id.toString() != user._id.toString() && user.counselor.toString() != meeting.counselor._id.toString()) {
            return res.redirect('/');
        }

        if (new Date(meeting.start) < new Date()) {
            return res.redirect('/dashboard');
        }
        await Meeting.findByIdAndDelete(req.params.id);

        let refund = new Refund();
        refund.meeting = meeting._id;
        //find payment from meeting checkout_session_id
        let payment = await Payment.findOne({ stripe_checkout_session_id: meeting.checkout_session_id });

        refund.user = meeting.user._id;
        refund.counselor = meeting.counselor._id;
        refund.reason = reason;
        refund.payment = payment._id;
        refund.amount = cost;
        await refund.save();


        return res.redirect('/dashboard');
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
))



export default router;