import express from 'express';
import Counselor from '../models/Counselor.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import CatchAsync from '../utils/CatchAsync.js';
import Essay from '../models/Essay.js';
import checkAdmin from '../utils/checkAdmin.js';
import sendEmail from '../utils/sendEmail2.js';


//start express router
const router = express.Router();


//admin routes


//application view
router.get('/application/:id', checkedLoggedIn, checkAdmin, CatchAsync(async (req, res) => {
    try {
        let application = await Application.findById(req.params.id);
        return res.render('counselor/application_view', { application });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }

}))


//approve application
router.post('/application/:id/approve', checkedLoggedIn, checkAdmin, CatchAsync(async (req, res) => {
    try {
        let application = await Application.findById(req.params.id);
        let user = await User.findById(application.user);
        user.counselor_status = "verified";

        //delete application
        await Application.findByIdAndDelete(application._id);
        let counselor = {
            user: user._id,
            first_name: application.first_name,
            last_name: application.last_name,
            profile_picture: application.profile_picture,
            bio: application.bio,
            current_university: application.current_university,
            accepted_universities: application.accepted_universities,
            graduation_year: application.graduation_year,
            rate: 40,
            major: application.major,
            reviews: [],
            calendar: null,
            status: "verified",
            phone_number: application.phone_number,
            email_address: application.email_address,
            city: application.city,
            SAT: application.SAT,
            ACT: application.ACT,
            gpa: application.gpa,
            race: application.race,
            gender: application.gender,
            international: application.international,
            first_gen: application.first_gen,
            low_income: application.low_income,
            legacy: application.legacy,
            classes: application.classes,
            awards: application.awards,
            extracurriculars: application.extracurriculars,
            long_bio: application.long_bio,
            zoom_meeting_link: application.zoom_meeting_link,



        }
        let new_counselor = await Counselor.create(counselor);
        user.counselor = new_counselor
        await user.save();

        //create 3 essays
        let essay_1 = {
            user: user._id,
            counselor: new_counselor._id,
            prompt: application.prompt_essay_1,
            essay: application.essay_1,
            university: application.university_essay_1
        }


        let essay_2 = {
            user: user._id,
            counselor: new_counselor._id,
            prompt: application.prompt_essay_2,
            essay: application.essay_2,
            university: application.university_essay_2
        }

        let essay_3 = {
            user: user._id,
            counselor: new_counselor._id,
            prompt: application.prompt_essay_3,
            essay: application.essay_3,
            university: application.university_essay_3
        }

        await Essay.create(essay_1);
        await Essay.create(essay_2);
        await Essay.create(essay_3);




        req.flash('success', 'Application approved');


        //send email
        let to = application.email_address;
        let subject = "Counselor Application Approved";
        sendEmail(to, subject,'application_approved.html', {first_name: application.first_name});




        return res.redirect('/admin/applications');
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))



//reject application
router.post('/application/:id/reject', checkedLoggedIn, checkAdmin, CatchAsync(async (req, res) => {
    try {
        let application = await Application.findById(req.params.id);
        //delete application
        await Application.findByIdAndDelete(application._id);
        req.flash('success', 'Application rejected');
        let current_user = await User.findById(application.user);
        current_user.counselor_status = "unverified";
        await current_user.save();

        //send email
        let to = application.email_address;
        let subject = "Counselor Application Rejected";
        sendEmail(to, subject, 'application_rejected.html', { first_name: application.first_name });




        return res.redirect('/admin/applications');
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))

//view all applications
router.get('/applications', checkedLoggedIn, checkAdmin, CatchAsync(async (req, res) => {
    try {
        let applications = await Application.find({});
        return res.render('counselor/applications', { applications });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))


export default router;

