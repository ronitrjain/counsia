import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema



const ReviewSchema = new Schema({ // Create a Review Schema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        type: Number,
        required: true,
        default: 1
    },
    review: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    hepful: {
        type: Number,
        default: 0
    }


}
    , { timestamps: true });


let Review = mongoose.model('Review', ReviewSchema); // Create a Review model
export default Review; // Export the Review model
