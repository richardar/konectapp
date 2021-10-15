const express = require('express')
const route = express.Router()

route.get('/test' , (req,res)  => {


    res.send('this is working')
})

route.get('/new', (req,res) =>{

res.render('newcard')

})





module.exports.cardsRouter = route