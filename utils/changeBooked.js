import Counselor from '../models/Counselor.js';
import Session from '../models/Session.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

//set dotenv
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
const stripe_api_key = process.env.STRIPE_API_KEY;
const stripe = Stripe(stripe_api_key);




function changeBooked(counselor_id, event_ids, session_id) {
    console.log('changeBooked called')


    setTimeout(async () => {
        try {
            let counselor = await Counselor.findOne({ _id: counselor_id });
            let session = await Session.findOne({ _id: session_id });

            if (session.paid) {
                return;
            } else {

                
                await Counselor.updateMany(
                    { _id: counselor._id, 'events.id': { $in: event_ids } },
                    { $set: { 'events.$.extendedProps': { isBooked: false }, 'events.$.backgroundColor': "#3888D8" } }
                );
                await stripe.checkout.sessions.expire(
                    session.stripe_checkout_session_id
                );


                await Session.deleteOne({ _id: session._id });

                console.log('success with changeBooked');

                return 'success';



            }
        } catch (error) {
            console.log(error);
            return 'error with changeBooked';
        }




    }, 1000 * 60*10);








}

export default changeBooked;