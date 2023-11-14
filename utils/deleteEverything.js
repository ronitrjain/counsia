//delete all users, counselors, applications, and essays from database
import User from '../models/User.js';
import Counselor from '../models/Counselor.js';
import Application from '../models/Application.js';
import Essay from '../models/Essay.js';
import Meeting from '../models/Meeting.js';
import Session from '../models/Session.js';
import Review from '../models/Review.js';
import Payment from '../models/Payment.js';

import mongoose from 'mongoose';

import dotenv from 'dotenv';

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

//mongo connection string
const mongo_user = process.env.MONGO_USER;
const mongo_pass = process.env.MONGO_PASS;

const mongo_url = `mongodb+srv://${mongo_user}:${mongo_pass}@counsia-test.jfrwm3o.mongodb.net/?retryWrites=true&w=majority`


//Mongo Connection
mongoose.connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Mongo Connection Open!!!");
}).catch(err => {
    console.log("Mongo Connection Error!");
    console.log(err);
});



const deleteEverything = async () => {
    await User.deleteMany({});
    await Counselor.deleteMany({});
    await Application.deleteMany({});
    await Essay.deleteMany({});
    await Meeting.deleteMany({});
    await Session.deleteMany({});
    await Review.deleteMany({});
    await Payment.deleteMany({});

    console.log('Deleted all users, counselors, applications, essays, meetings, and sessions');
    mongoose.connection.close();
}

deleteEverything();