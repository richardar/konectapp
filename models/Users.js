const passportLocalMongoose = require('passport-local-mongoose')

const mongoose = require('mongoose')



const userSchema = new mongoose.Schema({

    email: String,
    isProfessional: Boolean,
    isCardCreated: Boolean


})


userSchema.plugin(passportLocalMongoose)


module.exports = mongoose.model('User', userSchema)