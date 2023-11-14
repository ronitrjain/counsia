import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema


const ApplicationSchema = new Schema({ // Create a ApplicationSchema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'pending'
    },
    first_name: {
        type: String,
        required: true,
        default: ''
    },
    last_name: {
        type: String,
        default: ''
    },
    phone_number: {
        type: String,
        required: true,
        default: ''
    },
    email_address: {
        type: String,
        required: true
    },
    gpa: {
        type: Number
    },
    accepted_universities: {
        type: Array,
        default: []
    },
    SAT: {
        type: Schema.Types.Mixed,
        default: 'NA'
    },
    ACT: {
        type: Schema.Types.Mixed,
        default: 'NA'

    },
    graduation_year: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String,
        default: ''
    },
    prompt_essay_1: {
        type: String,
        required: true,
        default: ''
    },
    university_essay_1: {
        type: String,
        required: true,
        default: ''
    },
    essay_1: {
        type: String,
        required: true,
        default: ''
    },
    prompt_essay_2: {
        type: String,
        required: true,
        default: ''
    },
    university_essay_2: {
        type: String,
        required: true,
        default: ''
    },
    essay_2: {
        type: String,
        required: true,
        default: ''
    },
    prompt_essay_3: {
        type: String,
        required: true,
        default: ''
    },
    university_essay_3: {
        type: String,
        required: true,
        default: ''
    },
    essay_3: {
        type: String,
        required: true,
        default: ''
    },
    proof_of_attendance: {
        type: String
    },
    proof_of_id: {
        type: String
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
    major: {
        type: String,
        required: true,
        default: ''
    },
    profile_picture: {
        type: String,
        default: '',
        required: true
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
        type: String
    },
    legacy: {
        type: String
    },
    first_gen: {
        type: String
    },
    low_income: {
        type: String
    },
    classes: {
        type: Array,
        default: []
    },
    awards: {
        type: Array,
        default: []
    },
    extracurriculars: {
        type: Array,
        default: []
    },
    long_bio: {
        type: String,
        default: ''
    },
    zoom_meeting_link: {
        type: String,
        default: ''
    },
    university_email: {
        type: String,
        default: '',
        unique: false
    }



}, { timestamps: true });


let Application = mongoose.model('Application', ApplicationSchema); // Create a Application model
export default Application; // Export the Application model
