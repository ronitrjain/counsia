import express from 'express';
import checkedLoggedIn from '../utils/checkedLoggedIn.js';
import CatchAsync from '../utils/CatchAsync.js';
import Review from '../models/Review.js'; // Import the Review model
import Counselor from '../models/Counselor.js'; // Import the Counselor model
import User from '../models/User.js'; // Import the User model
const router = express.Router();



// Create a new review
router.post('/:counselor_id', checkedLoggedIn, CatchAsync(async (req, res) => {

    try {
        let review_text = req.body.reviewText.trim();
        let counselor_id = req.params.counselor_id;



        if (req.body.rating == "NaN") {
            req.flash('error', 'Please enter a valid rating');
            res.redirect(`/counselor/${counselor_id}`);
            return;
        }

        let rating = new Number(req.body.rating);




        let user_id = req.user._id;

        let counselor = await Counselor.findById(counselor_id);


        let user = await User.findById(user_id);

        let review = new Review({
            user: user,
            counselor: counselor,
            rating: rating,
            review: review_text
        });



        counselor.reviews.push(review);



        counselor.total_rating += rating;
        counselor.total_reviews += 1;
        counselor.average_rating = counselor.total_rating / counselor.total_reviews;



        counselor.rating_distribution[Math.floor(rating) - 1] += 1;





        await counselor.save();

        await review.save();

        req.flash('success', 'Review added successfully');



        res.redirect(`/counselor/${counselor_id}`);

    }
    catch (e) {
        console.log(e);
        req.flash('error', 'Something went wrong');
        res.redirect(`/counselor/${counselor_id}`);

    }


}));

//get nth to mth reviews of a counselor
router.get('/:counselor_id/:page', CatchAsync(async (req, res) => {
    let counselor_id = req.params.counselor_id;
    let page = req.params.page;

    let n = (page)* 10;
    let counselor = await Counselor.findById(counselor_id).populate({
        path: 'reviews',
        populate: {
            path: 'user'
        }
    });


    if (counselor.reviews.length < n-10) {
        console.log('no reviews');
        return res.json([]);
    }

    let reviews = counselor.reviews.slice(0, n);
    console.log(reviews);

    res.json(reviews);

}));

export default router;



