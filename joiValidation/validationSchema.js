const joi = require('joi')


module.exports.formValidation = joi.object({

    name: joi.string().required(),
    price: joi.number().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    specilization: joi.string().required(),
    image: joi.string().required()


}).required()


module.exports.cardsValidation = joi.object({


name: joi.string().required(),
age: joi.string().required(),
experience: joi.number().required(),
location: joi.string().required(),
image: joi.string().required(),
contact: joi.string().required(),
specilization: joi.string().required(),

email : joi.string().required()

}).required()



module.exports.reviewValidation = joi.object({

    rating : joi.number().required(),
    review : joi.string().required()
}).required()