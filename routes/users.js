const express = require('express')
const User = require('../models/Users')
const passport = require('passport')
const {registerValidation,loginValidation} = require('../joiValidation/validationSchema')
const appError = require('../utils/appError')

const route = express.Router()

const registerValidate = (req,res,next) => {

    const {error} = registerValidation.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message)
        next(new appError(msg, 404))
    
    
       }else{
           next()
       }

}

const loginValidate = (req,res,next) => {


    const {error} = loginValidation.validate(req.body)

    if(error){
        const msg = error.details.map(el => el.message)
        next(new appError(msg, 404))
    
    
       }else{
           next()
       }
}

route.get('/register',  (req,res) => {
    res.render('register')

})

route.post('/register',registerValidate,async (req,res) => {

try {
    const {email,username,password,isProfessional} = req.body
    if(isProfessional){

        const usr = new User({email,username,isProfessional})
        const registeredUser = await  User.register(usr,password)
        req.login(registeredUser, function(err) {
            if (err) { return next(err); }
            return res.redirect('/bids/all');
          });
        
    }
    else{
        const usr = new User({email,username})
        const registeredUser = await User.register(usr,password)
        req.login(registeredUser, function(err) {
            if (err) { return next(err); }
            return res.redirect('/bids/all');
          });
        
    }
    
    
} catch (error) {
    next(new appError(error, 404))
}
    



})

route.get('/login', (req,res) => {

    res.render('login')
})

route.post('/login', passport.authenticate('local', { 
    failureFlash: true,
     failureRedirect: '/user/login',
    successFlash: true}), (req,res)=> {

     req.flash('success', 'successfully logged in , welcome back :)')
     
     res.redirect('/bids/all')
        


     })

route.get('/logout', (req,res) => {

    req.logOut()
    res.redirect('/bids/all')
})







module.exports.userRouter = route