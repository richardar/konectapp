const express = require('express')
const route = express.Router()

route.get('/test' , (req,res)  => {


    res.send('this is working')
})







module.exports.cardsRouter = route