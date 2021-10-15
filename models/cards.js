const mongoose = require('mongoose')
const Review = require('./Reviews')
const User   = require('./Users')
 



const cardsSchema = new mongoose.Schema({

name: String,

age : Number,

experience: Number,

location:String,

image: String,

specilization: {

    type:String,
    enum: ['electrician','plumber','mechanic']
},

contact: Number,
email: String,
reviews:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: Review
    }
],

user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
}

})


module.exports = mongoose.model('Card',cardsSchema )