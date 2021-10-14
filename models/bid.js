const mongoose = require('mongoose')

const bidSchema = new mongoose.Schema({
    
    name: String,
    price : Number,
    description: String,
    location: String,
    image: String,
    highestBidder: {
      name: String,
      highPrice: Number
     },
     previousBidders: [{previousName: String , PreviousPrice: Number}]
     
})

module.exports = mongoose.model('Bid', bidSchema)