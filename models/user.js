const mongoose = require('mongoose');

mongoose.connect("mongodb://admin:admin123@localhost:27017/social-app?authSource=admin");

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    age : Number,
    email: String,
    password: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }]
})

module.exports = mongoose.model('user', userSchema);