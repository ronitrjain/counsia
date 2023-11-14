import express from 'express';
import aws from 'aws-sdk';
import world_universities from '../public/assets/json/world-universities.json' assert { type: 'json' };
import college_data from '../public/assets/json/college-data.json' assert { type: 'json' };
import url_to_college from '../public/assets/json/url-to-college.json' assert { type: 'json' };
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import formatTimeString from '../utils/formatTimeString.js';
import hasApplied from '../utils/hasApplied.js';
import Counselor from '../models/Counselor.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Session from '../models/Session.js';
import Essay from '../models/Essay.js';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import CatchAsync from '../utils/CatchAsync.js';
import changeBooked from '../utils/changeBooked.js';
import Review from '../models/Review.js';
import sendEmail from '../utils/sendEmail2.js';



//set dotenv
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}


//env variables
const aws_secret_key = process.env.AWS_SECRET_ACCESS_KEY;
const aws_access_key = process.env.AWS_ACCESS_KEY_ID;
let aws_name = process.env.AWS_BUCKET_NAME;
const stripe_api_key = process.env.STRIPE_API_KEY;
const stripe_callback_url = process.env.STRIPE_CALLBACK_URL;


//stripe config
const stripe = Stripe(stripe_api_key);



//AWS Configs
aws.config.update({
    secretAccessKey: aws_secret_key,
    accessKeyId: aws_access_key,
    signatureVersion: 'v4',
    region: 'us-east-1'

});

const s3 = new aws.S3({
    params: {
        Bucket: aws_name,
        signatureVersion: 'v4',
        region: 'us-east-1'
    }
});

//start express router
const router = express.Router();



//routes

//application for counselor view
router.get('/apply', function (req, res) {
    res.render('counselor/application_form', { world_universities });
})



//application for counselor post
router.post('/apply', checkedLoggedIn, hasApplied, CatchAsync(async (req, res) => {
    try {
        let user = req.user;
        let files = req.files;


        let key_3 = Date.now() + '_profile_picture_' + user.username + '_' + files[0].originalname



        let dest_3 = ''





        let params = {
            Bucket: "college-connect-profile-pictures",
            Key: key_3,
            Body: files[0].buffer
        };
        let data_3 = await s3.upload(params).promise();

        dest_3 = data_3.Location;

        console.log(req.body);


        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let phone_number = req.body.phone_number;
        let gpa = req.body.gpa;
        let email_address = req.body.email_address;
        let accepted_universities = req.body.acceptedUniversities;
        let current_university = req.body.current_university;
        let SAT = req.body.SAT;
        let graduation_year = req.body.graduation_year;
        let address = req.body.address;
        let city = req.body.city;
        let ACT = req.body.ACT;
        let major = req.body.major;
        let bio = req.body.bio;
        let long_bio = req.body.long_bio;
        let race = req.body.race;
        let gender = req.body.gender;
        let international = req.body.international;
        let legacy = req.body.legacy;
        let low_income = req.body.low_income;
        let first_gen = req.body.first_gen;
        let classes = req.body.class;
        let awards = req.body.awards;
        let extracurriculars = req.body.extracurriculars;
        let prompt_essay_1 = req.body.prompt_essay_1;
        let essay_1 = req.body.essay_1_text;
        let university_essay_1 = req.body.university_essay_1;
        let prompt_essay_2 = req.body.prompt_essay_2;
        let essay_2 = req.body.essay_2_text;
        let university_essay_2 = req.body.university_essay_2;
        let essay_3_prompt = req.body.prompt_essay_3;
        let essay_3_text = req.body.essay_3_text;
        let university_essay_3 = req.body.university_essay_3;
        let zoom_meeting_link = req.body.zoom_meeting_link;




        let application = {
            user: user._id,
            first_name,
            last_name,
            phone_number,
            gpa,
            email_address,
            accepted_universities,
            current_university,
            SAT,
            graduation_year,
            address,
            city,
            ACT,
            major,
            bio,
            race,
            gender,
            international,
            legacy,
            low_income,
            first_gen,
            classes,
            awards,
            extracurriculars,
            prompt_essay_1,
            essay_1,
            university_essay_1,
            prompt_essay_2,
            essay_2,
            university_essay_2,
            prompt_essay_3: essay_3_prompt,
            essay_3: essay_3_text,
            university_essay_3,
            profile_picture: dest_3,
            long_bio,
            zoom_meeting_link

        }



        await Application.create(application);
        let current_user = await User.findById(req.user._id);
        current_user.counselor_status = "pending";
        await current_user.save();
        let subject = "Counsia Application Received";
        let text = "Thank you for applying to be a counselor at Counsia! We have received your application and will get back to you within 24 hours."
        sendEmail(email_address, subject, 'application_received.html', { first_name });
        res.redirect('/counselor/application/received');
    } catch (e) {
        console.log(e);
        req.flash('error', "Something went wrong. Check fields again! Make sure your university email is unique and all fields are filled!");
        sendEmail('mnshah0101@gmail.com', 'Counsia Application Error', 'application_error.html', { error: e })
        return res.redirect('/counselor/application/failed');
    }


}))

router.get('/application/failed', (req, res) => {
    res.render('misc/application_failed.ejs');
}
)



//get popular counselors
router.get('/popular', CatchAsync(async (req, res) => {
    try {
        let counselors = await Counselor.find({}).sort({ views: -1 });
        counselors = counselors.slice(0, 9);
        return res.render('counselor/popular', { counselors });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
))


//get application process
router.get('/application-process', CatchAsync(async (req, res) => {
    res.render('counselor/application_process');
}
));



//search counselors
router.get('/search', CatchAsync(async (req, res) => {
    try {
        let counselors = await Counselor.find({ status: "verified" });
        return res.render('counselor/search', { counselors, world_universities });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))

router.get('/college/:college', CatchAsync(async (req, res) => {
    try {

        let college = url_to_college[req.params.college];

        console.log(college)


        let college_data_obj = college_data[college];


        //get counselors who have college in accepted_universities





        let counselors = await Counselor.find({ accepted_universities: college }).sort({ views: -1 });

        return res.render('counselor/college', { counselors, college, home: true, college_data_obj });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
))

//view counselor profile
router.get('/:id', CatchAsync(async (req, res) => {
    try {


        const counselor = await Counselor.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    model: 'User' // Replace 'User' with the actual model name for the user
                }
            })
            .populate('user'); // Populate the 'user' field of the 'Counselor' document itself        console.log(counselor);
        let essays = (await Essay.find({ user: counselor.user })).splice(0, 3);
        let reviews = counselor.reviews



        counselor.views += 1;
        await counselor.save();

        return res.render('counselor/profile', { home: true, counselor, essays, reviews: reviews.slice(0, 10) });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }

}))

//view counselor booking
router.get('/book/:id', CatchAsync(async (req, res) => {

    try {




        let counselor = await Counselor.findById(req.params.id);
        //nake now 24 hours from now
        let now = new Date();
        now.setHours(now.getHours() + 24);


        let bookable_events = counselor.events.filter((event) => new Date(event.start) > now)
        bookable_events = bookable_events.filter((event) => event.extendedProps.isBooked == false)





        let user = req.user;

        let events = []

        for (let event of counselor.events) {
            if (new Date(event.start) < now) {
                event.backgroundColor = "#E7EAF3"
                events.push(event);
            }
            else {
                events.push(event);
            }
        }


        counselor.events = events;





        return res.render('counselor/book', { counselor, user, bookable_events });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))



//book a counselor

router.post('/book/:id', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let counselor = await Counselor.findById(req.params.id)
        let counselor_user = await User.findById(counselor.user);
        let user = req.user;
        let booked_event_ids = req.body.booked_events

        //if booked_events_ids has length one, make it an array
        if (typeof booked_event_ids == 'string') {
            booked_event_ids = [booked_event_ids];
        }

        let booked_events = [];
        for (let id of booked_event_ids) {
            let event = counselor.events.find(event => event.id == id);
            booked_events.push(event);
        }

        for (let event of booked_events) {
            if (event.extendedProps.isBooked == true) {
                req.flash('error', 'One or more of the selected timeslots are already booked');
                return res.redirect('/counselor/book/' + counselor._id);
            }
        }

        for (let event_id of booked_event_ids) {
            await Counselor.updateOne(
                { _id: counselor._id, 'events.id': event_id },
                {
                    $set: {
                        'events.$.extendedProps.isBooked': true,
                        'events.$.backgroundColor': '#F38225'
                    }
                }
            );
        }






        //create products and prices
        let products = [];
        let prices = [];

        for (let event of booked_events) {
            let product = await stripe.products.create({
                name: 'Counsia Counseling Session',
                description: formatTimeString(event.start, 'date') + ' ' + formatTimeString(event.start, 'time') + " Online Session with " + counselor.first_name + " " + counselor.last_name,
                images: [counselor.profile_picture],
            });
            let price = await stripe.prices.create({
                product: product.id,
                unit_amount: 5999,
                currency: 'usd',
                tax_behavior: 'exclusive',
            });
            products.push(product);
            prices.push(price);
        }

        //create checkout session
        let line_items = [];
        for (let price of prices) {
            line_items.push({
                price: price.id,
                quantity: 1
            })
        }

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: stripe_callback_url + "/payment/success/?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: stripe_callback_url + "/payment/cancel/?session_id={CHECKOUT_SESSION_ID}",
            automatic_tax: { enabled: true },
        });



        //create session in mongo

        let session_mongo = {
            user: user._id,
            counselor: counselor._id,
            events: booked_event_ids,
            stripe_checkout_session_id: session.id,
            paid: false
        }
        let created_session = await Session.create(session_mongo);

        changeBooked(counselor._id, booked_event_ids, created_session._id);



        await counselor_user.save();




        res.redirect(303, session.url);

    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))



//update counselor info in dashboard
router.post('/:id/info/update', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        let user = req.user;

        let counselor = await Counselor.findById(req.params.id);






        let files = req.files;
        let dest_3 = ""


        if (files[0]) {
            //check if file is an image
            if (!files[0].mimetype.startsWith('image')) {
                req.flash('error', 'Please upload an image file');
                return res.redirect('/counselor/' + counselor._id);
            }

            let key = Date.now() + '_profile_picture_' + user.username + '_' + files[0].originalname

            let params = {
                Bucket: "college-connect-profile-pictures",
                Key: key,
                Body: files[0].buffer
            };

            let data_3 = await s3.upload(params).promise();

            dest_3 = data_3.Location;

        }

        let classes = req.body.classes.split('\n');
        let awards = req.body.awards.split('\n');
        let extracurriculars = req.body.extracurriculars.split('\n');

        classes = classes.filter((item) => item.trim() != "");
        awards = awards.filter((item) => item.trim() != "");
        extracurriculars = extracurriculars.filter((item) => item.trim() != "");





        //update counselor

        const filter = { _id: req.params.id };
        let update = {}

        if (dest_3 != '') {
            update = { classes, awards, extracurriculars, long_bio: req.body.long_bio, zoom_meeting_link: req.body.zoom_meeting_link, first_name: req.body.first_name, last_name: req.body.last_name, bio: req.body.bio, major: req.body.major, gpa: req.body.gpa, current_university: req.body.current_university, profile_picture: dest_3 };
        } else {
            update = { classes, awards, extracurriculars, long_bio: req.body.long_bio, first_name: req.body.first_name, last_name: req.body.last_name, bio: req.body.bio, major: req.body.major, gpa: req.body.gpa, current_university: req.body.current_university, zoom_meeting_link: req.body.zoom_meeting_link };

        }


        await Counselor.findOneAndUpdate(filter, update);



        return res.redirect('/dashboard/counselor-update');
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
));

router.get('/application/received', (req, res) => {
    res.render('misc/application_success.ejs');
}
)



export default router;