const joi = require('joi')


module.exports.formValidation = joi.object({

    name: joi.string().required(),
    price: joi.number().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    specilization: joi.string(),
    image: joi.string().required()


})