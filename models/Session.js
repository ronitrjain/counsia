import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema


const SessionSchema = new Schema({ // Create a SessionSchema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    paid: {
        type: Boolean,
        default: false
    },
    stripe_checkout_session_id: {
        type: String
    },
    events: [{
        type: String
    }]
}, { timestamps: true });


let Session = mongoose.model('Session', SessionSchema); // Create Session model
export default Session; // Export the Session model
