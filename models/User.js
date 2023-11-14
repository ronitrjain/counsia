import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema
import passport from 'passport-local-mongoose'; // Import passport-local-mongoose (for authentication)


const UserSchema = new Schema({ // Create a UserSchema
    email: {
        type: String,
        required: true,
        unique: true
    },

    firstName: {
        type: String,
        required: true,
        unique: false

    },
    lastName: {
        type: String,
        required: true,
        unique: false
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    role:
    {
        type: String,
        required: true,
        default: 'user'
    },
    counselor_status: {
        type: String,
        default: 'unverified'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'Counselor'
    },
    profile_picture: {
        type: String,
        default: ''
    },
    password_reset_token: {
        type: String,
        default: ''
    },
    meetings: {
        type: Array,
        default: []
    },
    bio: {
        type: String,
        default: ''
    },
    interested_universities: {
        type: Array,
        default: []
    },
    major: {
        type: String,
        default: ''
    },
    SAT: {
        type: Number,
        default: null
    },
    ACT: {
        type: Number,
        default: null
    },
    gpa: {
        type: Number,
        default: null
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
    ]


}, { timestamps: true });
UserSchema.plugin(passport); // Add passport-local-mongoose to UserSchema


let User = mongoose.model('User', UserSchema); // Create a User model
export default User; // Export the User model
