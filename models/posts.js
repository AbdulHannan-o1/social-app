const mongoose = require('mongoose');
const user = require('./user');
const { text } = require('express');

 const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    content: String,
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    ],
    comments: [
            {
                text: String,
                author: {type: mongoose.Schema.Types.ObjectId, ref: user}
        }
        
    ]

}, {timestamps: true})

module.exports = mongoose.model('post', postSchema);