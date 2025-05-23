import mongoose from 'mongoose';

const customizationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    front: [{
        url: String,
        position: {
            x: String,
            y: String,
        },
        text: String,
        fontFamily: String,
        fontSize: Number,
        fontWeight: String,
        fontCase: String,
        color: String,
    }],
    back: [{
        url: String,
        position: {
            x: String,
            y: String,
        },
        text: String,
        fontFamily: String,
        fontSize: Number,
        fontWeight: String,
        fontCase: String,
        color: String,
    }],
    leftSleeve: [{
        url: String,
        position: {
            x: String,
            y: String,
        },
        text: String,
        fontFamily: String,
        fontSize: Number,
        fontWeight: String,
        fontCase: String,
        color: String,
    }],
    rightSleeve: [{
        url: String,
        position: {
            x: String,
            y: String,
        },
        text: String,
        fontFamily: String,
        fontSize: Number,
        fontWeight: String,
        fontCase: String,
        color: String,
    }],
}, { timestamps: true });

const Customization = mongoose.model('Customization', customizationSchema);
export default Customization;