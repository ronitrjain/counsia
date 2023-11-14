import express from 'express';
import User from '../models/User.js';
import Counselor from '../models/Counselor.js';
import Session from '../models/Session.js';
import Meeting from '../models/Meeting.js';
import Payment from '../models/Payment.js';
import CatchAsync from '../utils/CatchAsync.js';
import datetoUTC from '../utils/dateToUTC.js';
import addOneHour from '../utils/addOneHour.js';
import sendEmail from '../utils/sendEmail2.js';



import dotenv from 'dotenv';
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
const cost = process.env.COST;
console.log(cost);


//start express router
const router = express.Router();


//checkout routes


//success route
router.get('/success', CatchAsync(async (req, res) => {
    try {
        let session_id = req.query.session_id

        let session_mongo = await Session.findOne({ stripe_checkout_session_id: session_id });
        let user = await User.findById(session_mongo.user);
        let counselor = await Counselor.findById(session_mongo.counselor).populate('user');



        let events_ids = session_mongo.events;
        let events = [];


        for (let id of events_ids) {
            let event = counselor.events.find(event => event.id == id);
            events.push(event);
        }

        await Counselor.updateMany(
            { _id: counselor._id, 'events.id': { $in: events_ids } },
            { $set: { 'events.$.extendedProps': { isBooked: true }, 'events.$.backgroundColor': "#F38225" } }
        );





        session_mongo.paid = true;
        await session_mongo.save();


        let counselor_user = await User.findById(counselor.user)

        await counselor_user.save();



        for (let event of events) {

            // Adding an hour to the date and time

            let start = datetoUTC(event.start);
            let end = addOneHour(start);


            // Formatting the new date and time back to ISO 8601 format

            let zoom_meeting_link = counselor.zoom_meeting_link









            let event_mongo = {
                user: user._id,
                counselor: counselor._id,
                start: start,
                end: end,
                paid: true,
                checkout_session_id: session_id,
                zoom_meeting_link: zoom_meeting_link
            }
            event_mongo = await Meeting.create(event_mongo);

            let date = new Date(start)
            date = date.toDateString()

            let time = new Date(start)
            time = time.toTimeString()




            sendEmail(user.email, 'Counsia Counseling Session with ' + counselor.first_name + " " + counselor.last_name + '', 'meeting_confirmation.html', { name: counselor.first_name + " " + counselor.last_name, meeting_date: date, meeting_time: time, id: event_mongo._id, email: counselor.email_address })


            sendEmail(counselor.user.email, 'Counsia Counseling Session with ' + user.firstName + " " + user.lastName + '', 'meeting_confirmation.html', { name: user.firstName + " " + user.lastName, meeting_date: date, meeting_time: time, id: event_mongo._id, email: user.email })


            user.meetings.push(event_mongo);
            counselor.meetings.push(event_mongo);
            await user.save();
            await counselor.save();





        }

        //create Payment object
        let payment = {
            user: user._id,
            stripe_checkout_session_id: req.query.session_id,
            counselor: counselor._id,
            session: session_id,
            amount: cost * events.length,
            status: "paid"
        }

        let created_payment = await Payment.create(payment);

        user.payments.push(created_payment);
        counselor.payments.push(created_payment);
        await user.save();
        await counselor.save();



        res.redirect('/order-completed');
    } catch (e) {
        console.log(e);
        //crette a failed status payment
        let payment = {
            user: req.user._id,
            stripe_checkout_session_id: req.query.session_id,
            status: 'failed'


        }
        let created_payment = await Payment.create(payment);
        let user = await User.findById(req.user._id);
        user.payments.push(created_payment)
        await user.save();

        res.render('checkout/failed');
    }
}))


//cancel route

router.get('/cancel', CatchAsync(async (req, res) => {
    try {

        let session_id = req.query.session_id
        let session_mongo = await Session.findOne({ stripe_checkout_session_id: session_id });
        let counselor = await Counselor.findById(session_mongo.counselor).populate('user');
        let events_ids = session_mongo.events;

        console.log("events ids" + events_ids)

        await Counselor.updateMany(
            { 'events.id': { $in: events_ids } },
            { $set: { 'events.$[elem].extendedProps.isBooked': false, 'events.$[elem].backgroundColor': '#3888D8' } },
            { arrayFilters: [{ 'elem.id': { $in: events_ids } }] }
        )





        //delete session
        await Session.findByIdAndDelete(session_mongo._id);




        res.render('checkout/failed');


    }
    catch (e) {
        console.log("Payment Route Error" + e);
        res.redirect('/');
    }

}))


export default router;