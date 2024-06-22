const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const otpSchema = new Schema({
    otp: {
        type: Number,
        required: true,
    },
    otpExpires: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    }, {
    timestamps: true
});
module.exports = mongoose.model('Otp', otpSchema);