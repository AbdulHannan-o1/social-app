const mongoose = require('mongoose');
// require('dotenv').config();

// if (mongoose.connection.readyState === 0) {
//   mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log("✅ MongoDB connected from user.js"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));
// }


const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    age : Number,
    email: String,
    password: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }]
})

module.exports = mongoose.model('user', userSchema);