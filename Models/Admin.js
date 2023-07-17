const mongoose = require('mongoose');
// Define the admin schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  is_admin: {
    type: Boolean,
    default: true
  }
});

// Create the admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
