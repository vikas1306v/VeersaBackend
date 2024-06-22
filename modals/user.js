const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('User', userSchema);