const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({

    review: String,
    rating: Number,
    user :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }]
    

})

module.exports = mongoose.model("Review", reviewSchema)