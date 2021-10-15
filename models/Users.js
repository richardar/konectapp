const passportLocalMongoose = require('passport-local-mongoose')

const mongoose = require('mongoose')




const userSchema = new mongoose.Schema({

    email: String,
    isProfessional: {
        type: Boolean,
        enum:[true]
    },
    isCardCreated: Boolean,
    card : mongoose.Schema.Types.ObjectId

})


userSchema.plugin(passportLocalMongoose)


module.exports = mongoose.model('User', userSchema)