const mongoose = require('mongoose')
const Review = require('./Reviews')
const User   = require('./Users')
 



const cardsSchema = new mongoose.Schema({

name: String,

age : Number,

experience: Number,

location:String,

image: [{
    url:String,
    path: String
}],
geometry: {
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
},

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