const mongoose = require('mongoose')




const cardsSchema = new mongoose.Schema({

name: String,

age : Number,

expreience: Number,

specilization: {

    type:string,
    enum: [electrician,plumber,mechanic,]
},

contactNumber: Number,
email: String,
reviews:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: Review
    }
]

})


module.exports = mongoose.model('Card',cardsSchema )