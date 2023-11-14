import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema

//dotenv
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

var cost = process.env.COST;



const PaymentSchema = new Schema({ // Create a Payment Schema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        default: "pending"
    },
    date: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        default: cost
    },

    stripe_checkout_session_id: {
        type: String
    },
    paid_to_counselor: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


let Payment = mongoose.model('Payment', PaymentSchema); // Create a Payment model
export default Payment; // Export the Payment model
