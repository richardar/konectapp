const mongoose = require('mongoose')
const User = require('./Users')
const bidSchema = new mongoose.Schema({
    
    name: String,
    price : Number,
    description: String,
    location: String,
    specilization: String,
    image: [{
      url:String,
      filename: String
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
    createdUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User
    },
    highestBidder: {
      highBidderName: {
        _id: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: User
      },
      highPrice: Number,
      
     },
     previousBidders: [{previousName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User
     } , previousPrice: Number}],
     isClosed: {
       type: Boolean,
       enum:[true]
     }
     
})

module.exports = mongoose.model('Bid', bidSchema)