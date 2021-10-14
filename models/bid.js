const mongoose = require('mongoose')

const bidSchema = new mongoose.Schema({
    
    name: String,
    price : Number,
    description: String,
    location: String,
    specilization: String,
    image: String,
    highestBidder: {
      highBidderName: String,
      highPrice: Number,
     },
     previousBidders: [{previousName: String , previousPrice: Number}],
     isClosed: {
       type: Boolean,
     }
     
})

module.exports = mongoose.model('Bid', bidSchema)