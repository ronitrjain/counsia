import express from 'express';
import Essay from '../models/Essay.js';
import world_universities from '../public/assets/json/world-universities.json' assert { type: 'json' };
import url_to_college from '../public/assets/json/url-to-college.json' assert { type: 'json' };
import college_data from '../public/assets/json/college-data.json' assert { type: 'json' };


import CatchAsync from '../utils/CatchAsync.js';
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import checkCounselor from '../utils/checkCounselor.js';
import dotenv from 'dotenv';
import Counselor from '../models/Counselor.js';

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
const router = express.Router();

//essay routes


router.get('/post', checkedLoggedIn, checkCounselor, (req, res) => {
    console.log('post essay')
    res.render('essay/post', { world_universities });
}
)

router.post('/post', checkedLoggedIn, checkCounselor, CatchAsync(async (req, res) => {


    try {
        let user = req.user;
        let counselor = user.counselor
        let prompt = req.body.prompt;
        let essay_text = req.body.essay_text;
        if (typeof essay_text !== 'string') {
            essay_text = essay_text.join('\n');
        }


        console.log(essay_text);

        let university = req.body.university;
        let essay = new Essay({ user, prompt, essay: essay_text, university, counselor });

        await essay.save();
        return res.redirect('/essay/' + essay._id);
    }
    catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
))




//get recent essays

router.get('/recent', CatchAsync(async (req, res) => {
    try {
        let essays = await Essay.find({}).sort({ createdAt: -1 }).populate('user').populate('counselor');
        essays = essays.slice(0, 50);
        return res.render('essay/recent', { essays });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
))

//get search page
router.get("/search", async (req, res) => {

    res.render('essay/search');

})

//get featured essay
router.get("/featured", async (req, res) => {

    let featured_id = process.env.FEATURED_ESSAY;



    res.redirect('/essay/' + featured_id);

})


router.get('/college/:college', CatchAsync(async (req, res) => {
    try {

        let college = url_to_college[req.params.college];
        console.log(college);
        let college_data_obj = college_data[college];

        let essays = await Essay.find({ university: college }).populate('user').populate('counselor').sort({ createdAt: -1 });
        return res.render('essay/college', { essays, college, home: true, college_data_obj });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}
))

//show essay

router.get('/:id', CatchAsync(async (req, res) => {
    try {
        let essay = await Essay.findById(req.params.id).populate('user');
        let essay_creator = essay.user;
        let user = req.user;
        let isCreator = false;
        let author = await Counselor.findOne({ user: essay.user._id });

        console.log(author);
        if (user) {
            if (user._id.equals(essay_creator._id)) {
                isCreator = true;
            }
            if(user.role =='admin' || user.username == 'admin'){
                isCreator = true;
            }
        }


        //get 3 most popular essays




        let essays = await Essay.find({}).sort({ likes: -1 }).populate('user').populate('counselor').limit(3);




        return res.render('essay/show', { essays, essay, isCreator, author, home: true });
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))


//edit essay

router.post('/:id/edit', checkedLoggedIn, CatchAsync(async (req, res) => {
    try {
        //edit prompt and essay
        let new_text = req.body.essay_text;
        let new_prompt = req.body.prompt;
        console.log(new_text);
        await Essay.findByIdAndUpdate(req.params.id, { essay: new_text, prompt: new_prompt });
        console.log('edit essay');
        return res.redirect('/essay/' + req.params.id);
    } catch (e) {
        console.log(e);
        return res.redirect('/');
    }
}))






export default router;