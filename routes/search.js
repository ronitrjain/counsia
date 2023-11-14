
import express from 'express';
import Counselor from '../models/Counselor.js';
import Essay from '../models/Essay.js';
import CatchAsync from '../utils/CatchAsync.js';



const router = express.Router();


//search routes


//search counselors
router.get('/counselors/', CatchAsync(async (req, res) => {
    try {
        const query = req.query.q;
        if (query.length < 1) return res.json([]);

        console.log('This is a query', query)
        const counselors = await Counselor.find({
            $or: [
                { first_name: { $regex: query, $options: 'i' } },
                { last_name: { $regex: query, $options: 'i' } },
                { current_university: { $regex: query, $options: 'i' } },
                { accepted_universities: { $regex: query, $options: 'i' } }, // Case-insensitive search
            ],
        });
        console.log('These are the counselors', counselors)
        return res.json(counselors.slice(0, 50));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}));






//search essays
router.get('/essays/', CatchAsync(async (req, res) => {
    try {
        const query = req.query.q;
        if (query.length < 1) return res.json([]);

        const essays = await Essay.find({
            $or: [
                { prompt: { $regex: query, $options: 'i' } },
                { university: { $regex: query, $options: 'i' } },
                { essay: { $regex: query, $options: 'i' } }, // Case-insensitive search
            ],
        }).populate('user').populate('counselor');
        return res.json(essays.slice(0, 50));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}));

export default router;