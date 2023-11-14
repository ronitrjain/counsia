import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema

const CounselorSchema = new Schema({ // Create a CounselorSchema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        default: 'unverified'
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        require: true
    },
    profile_picture: {
        type: String,
        default: '',
        required: true
    },
    calendar_id: {
        type: String,
        default: ''
    },

    bio: {
        type: String,
        required: true,
        default: ''
    },
    current_university: {
        type: String,
        required: true,
        default: ''
    },
    SAT: {
        type: Schema.Types.Mixed,
        default: 'NA'
    },
    ACT: {
        type: Schema.Types.Mixed,
        default: 'NA'
    },
    accepted_universities: {
        type: Array,
        required: true,
        default: []
    },
    graduation_year: {
        type: Number,
        required: true,
        default: 2023
    },
    reviews:
        [
            {
                type: Schema.Types.ObjectId,
                ref: 'Review'
            }
        ]
    ,
    rate: {
        type: Number,
        required: true,
        default: 40
    },
    major: {
        type: String,
        required: true,
        default: ''
    },
    events: {
        type: Array,
        required: true,
        default: []
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    average_rating: {
        type: Number,
        required: true,
        default: 0
    },
    total_rating: {
        type: Number,
        required: true,
        default: 0
    },
    total_reviews: {
        type: Number,
        required: true,
        default: 0
    },
    rating_distribution: {
        type: Array,
        required: true,
        default: [0, 0, 0, 0, 0]
    },
    meetings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        }
    ],
    payments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Payment'
        }
    ],
    phone_number: {
        type: String,
        required: true,
        default: ''
    },
    email_address: {
        type: String,
        required: true,
        default: ''
    },
    city: {
        type: String,
        required: true,
        default: ''
    },
    gpa: {
        type: Number,
        required: true,
        default: 0
    },
    race: {
        type: String,
        required: true,
        default: ''
    },
    gender: {
        type: String,
        required: true,
        default: ''
    },
    international: {
        type: String,
    },
    first_gen: {
        type: String,
    },
    low_income: {
        type: String,
    },
    legacy: {
        type: String,
    },
    classes: {
        type: Array,
        required: true,
        default: []
    },
    awards: {
        type: Array,
        required: true,
        default: []
    },
    extracurriculars: {
        type: Array,
        required: true,
        default: []
    },
    stripe_id: {
        type: String,
        default: ''
    },
    long_bio: {
        type: String,
        default: ''
    },
    zoom_meeting_link: {
        type: String,
        default: ''
    }











}, { timestamps: true });


let Counselor = mongoose.model('Counselor', CounselorSchema); // Create a Counselor model
export default Counselor; // Export the Counselor model
