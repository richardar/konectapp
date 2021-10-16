
const express = require('express')
const Bid = require('../models/bid')
const appError = require('../utils/appError')
const mongoose = require('mongoose')
const route = express.Router()
const {formValidation,cardsValidation} = require('../joiValidation/validationSchema')
const flash = require('express-flash')
const multer  = require('multer')
const {cloudinary,storage} = require('../cloudinary/index')
const upload = multer({ storage })
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPTOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })






const formValidate = (req,res,next) => {

    const {error} = formValidation.validate(req.body)
   if(error){
    const msg = error.details.map(el => el.message)
    next(new appError(msg, 404))


   }else{
       next()
   }

}

const isloggedin = (req,res,next) => {

    if (!req.isAuthenticated()){

        req.flash('error', 'you must be logged in')
        res.redirect('/user/login')


    }else{
        next()
    }
}

const isBidCreator = async (req,res,next) => {

    const id = req.params.id
    const bids = await Bid.findById(id)

    BidUserId = bids.createdUser._id
    currentUserId = req.user._id
    if(JSON.stringify(BidUserId) == JSON.stringify(currentUserId)){

        next()
        
    } else {

        req.flash('error','sorry you are not authorized to do this :(')
        res.redirect('/bids/all')
    }

}

const ispro = (req,res,next) => {


    if(req.user.isProfessional){

        next()
        
    } else{
        req.flash('error', 'sorry you are not a professional.')
        res.redirect('/cards')
    }
}

const isCardCreated = (req,res,next) => {

    if(req.user.isCardCreated){

        next()

    } else{

        req.flash('error','you want to create your card first')
        res.redirect('/cards/new')
    }

}

route.get('/open', async (req,res,next) => {
    try {
        const bids = await Bid.find({})

        res.render('bidsopen', {bids})
    
        
    } catch (error) {
        next(new appError(error, 404))
    }
})
   


route.get('/all', async (req,res) => {

    try {
        const bids = await Bid.find({})
    res.render('bidsall', {bids})
    } catch (error) {
     next(new appError(error,404))
        
    }
    
})



route.get('/new',isloggedin, (req,res) => {
    res.render('new')
})

route.post('/new',isloggedin,upload.array('image'),formValidate, async (req,res) => {

    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()



    const body = req.body;

    const bids = new Bid(req.body)
    bids.createdUser = req.user
   const image = req.files.map(f => ({ url: f.path, filename: f.filename }));
   bids.geometry = geoData.body.features[0].geometry;
   bids.image = image
   await bids.save()
   req.flash('success','successfully created a new bidding.')
    res.redirect(`/bids/${bids._id}`)



})

route.get('/:id' , async (req,res) => {

    const id = req.params.id;
    const bids = await Bid.findById(id).populate('createdUser').populate('highestBidder.highBidderName').populate('previousBidders.previousName')

   res.render('show', {bids})
})

route.delete('/:id', async (req,res) => {

    const id = req.params.id;
    const bids = await Bid.findByIdAndDelete(id)
res.redirect('/bids/all')

})


route.get('/:id/edit',isloggedin,isBidCreator, async (req,res) => {
    const id = req.params.id;
    const bids = await Bid.findById(id)

    res.render('edit',{bids})
})
route.put('/:id/edit',formValidate,isloggedin,isBidCreator,async (req,res) => {

    const id = req.params.id;
    console.log(req.body)
    const bids = await Bid.findByIdAndUpdate(id,req.body)
    req.flash('success', 'successfully edited the campground')
    res.redirect(`/bids/${bids._id}`)


})


route.post('/:id/submitbid',isloggedin,ispro,isCardCreated, async (req,res) => {
    
    const {id} = req.params

const bids = await Bid.findById(id)



if(bids.highestBidder.highBidderName){

    const previousName = bids.highestBidder.highBidderName
    const previousPrice = bids.highestBidder.highPrice
 
    bids.highestBidder.highBidderName = req.user._id
    bids.highestBidder.highPrice = req.body.highPrice
     
    bids.previousBidders.push({previousName,previousPrice})
    await bids.save()
    res.redirect(`/bids/${bids._id}`)
 

} else {

   bids.highestBidder.highBidderName = req.user._id
    bids.highestBidder.highPrice = req.body.highPrice
   await bids.save()
   res.redirect(`/bids/${bids._id}`)
    

}

})


route.post('/:id/closebid',isloggedin,isBidCreator,async (req,res) => {

    const id = req.params.id
    const bids = await Bid.findById(id)
    await Bid.findByIdAndUpdate(id, { $set: { previousBidders: [] }})

    
    bids.isClosed = true
    await bids.save()
    req.flash('success', 'bid successfully closed')
    res.redirect(`/bids/${id}`)
    
})


module.exports.bidsRouter = route