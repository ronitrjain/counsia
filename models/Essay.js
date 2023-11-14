import mongoose from 'mongoose'; // Import mongoose
const { Schema } = mongoose; // Create a Schema


const EssaySchema = new Schema({ // Create a EssaySchema
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'Counselor'
    },
    prompt: {
        type: String,
        required: true,
    },
    essay: {
        type: String,
        required: true,
    },
    university: {
        type: String,
        required: true,
    },
}, { timestamps: true });


let Essay = mongoose.model('Essay', EssaySchema); // Create an Essay model
export default Essay; // Export the Essay model
