import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema



const RefundSchema = new Schema({ // Create a Review Schema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    meeting: {
        type: Schema.Types.ObjectId,
        ref: 'Meeting'
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    },
    amount : {
        type: Number
    },
    reason: {
        type: String
    },
    status: {
        type: String,
        default: 'pending'
    }
}
    , { timestamps: true });


let Refund = mongoose.model('Refund', RefundSchema); // Create a Review model
export default Refund; // Export the Review model
