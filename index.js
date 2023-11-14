import express from 'express';
import mongoose from 'mongoose';
import engine from 'ejs-mate';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import multer from 'multer';
import User from './models/User.js';
import Essay from './models/Essay.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';
import dashboardRoutes from './routes/dashboard.js';
import counselorRoutes from './routes/counselor.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import dashboardv2Routes from './routes/dashboard-v2.js';
import meetingRoutes from './routes/meeting.js';
import adminRoutes from './routes/admin.js';
import essayRoutes from './routes/essay.js';
import searchRoutes from './routes/search.js';
import reviewRoutes from './routes/review.js';
import ExpressError from './utils/ExpressError.js';
import MongoStore from 'connect-mongo';
import cron from 'node-cron';
import compression from 'compression';
import sendReminder from './utils/sendReminder.js';
import ExpressMongoSanitize from 'express-mongo-sanitize';
//dotenv config
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}


//start express application
const app = express();
app.use(compression())



const port = process.env.PORT || 80;


//mongo connection string
const mongo_user = process.env.MONGO_USER;
const mongo_pass = process.env.MONGO_PASS;

const mongo_url = `mongodb+srv://${mongo_user}:${mongo_pass}@counsia-test.jfrwm3o.mongodb.net/?retryWrites=true&w=majority`





//path config

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let SESSION_NAME = process.env.SESSION_NAME;
let SESSION_SECRET = process.env.SESSION_SECRET;






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







//Express configs
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 86400000,
    setHeaders: function (res, path) {
        res.setHeader("Expires", new Date(Date.now() + 2592000000 * 30).toUTCString());
    }
}));

//every 30 minutes, check for meetings in the next hour and send reminder emails
cron.schedule('*/30 * * * *', () => {
    sendReminder();
});



//multer
const upload_profile = multer();
app.use(upload_profile.any());


//Session Configs
app.use(session({
    name: SESSION_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: mongo_url, // replace with your MongoDB connection string
        collectionName: 'sessions_', // optional; default is 'sessions'
    }),
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));


//Pasport Configuration
app.use(passport.initialize());
app.use(passport.session())    //allow passport to use "express-session"
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Middleware-Controller Functions

app.use(async (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});















//Routers
app.use('/dashboard', dashboardv2Routes)

app.use('/', userRoutes)
app.use('/meeting', meetingRoutes)
app.use('/payment', paymentRoutes)
app.use('/counselor', counselorRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/admin', adminRoutes)
app.use('/essay', essayRoutes)
app.use('/search', searchRoutes)
app.use('/review', reviewRoutes)



//misc and home routes
app.get('/order-completed', async (req, res) => {


    res.render('checkout/completed');

})


app.get('/privacy-policy', async (req, res) => {
    res.render('misc/privacy');
});


app.get('/requirements', async (req, res) => {
    res.render('counselor/requirements');
}
);

app.get('/about', async (req, res) => {
    res.render('misc/about', { home: true });
}
);

app.get('/pricing', async (req, res) => {
    res.render('misc/pricing');
}
);

app.get("/contact", async (req, res) => {
    res.render('misc/contact');
}
);

app.get('/terms', async (req, res) => {
    res.render('misc/terms');
}
);

app.get('/help/apply', async (req, res) => {

    res.render('documentation/application');
});

app.get('/help/onboarding', async (req, res) => {

    res.render('documentation/mentor_onboarding');
});



app.get('/', async function (req, res) {
    let essays = await Essay.find({});
    essays = essays.slice(0, 3);
    res.render('home', { essays, home: "isHome" });
})

app.get('/sitemap.xml', async (req, res) => {
    res.redirect('https://mokshsitemaps.s3.amazonaws.com/sitemap.xml')
}
);



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('404', { err })
})




//start server

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
})


