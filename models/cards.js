const mongoose = require('mongoose')
const Review = require('./Reviews')
 



const cardsSchema = new mongoose.Schema({

name: String,

age : Number,

expreience: Number,

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
]

})


module.exports = mongoose.model('Card',cardsSchema )