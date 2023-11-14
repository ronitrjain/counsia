import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema


const MeetingSchema = new Schema({ // Create a Meeting Schema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'Counselor'
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    zoom_meeting_link: {
        type: String,
        default: ''
    },
    paid: {
        type: Boolean,
        default: false
    },
    checkout_session_id: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: 'general'
    },
    student_comments: {
        type: String,
        default: 'No Comments Yet'
    },
    student_first_name: {
        type: String,
        default: ''
    },
    student_last_name: {
        type: String,
        default: ''
    },
    student_email: {
        type: String,
        default: ''
    }


}, { timestamps: true });


let Meeting = mongoose.model('Meeting', MeetingSchema); // Create a Meeting model
export default Meeting; // Export the Meeting model
