const express = require('express')
const route = express.Router()
const Card = require('../models/cards')
const appError = require('../utils/appError')
const Review = require('../models/Reviews')
const {cardsValidation} = require('../joiValidation/validationSchema')
const flash = require('express-flash')
const { userRouter } = require('./users')
const cards = require('../models/cards')
const User = require('../models/Users')
const multer = require('multer')
const {cloudinary,storage} = require('../cloudinary/index')
const upload = multer({ storage })
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPTOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })




const cardvalidator = (req,res,next) => {
try {
    const {error} = cardsValidation.validate(req.body)
    if(error){
     const msg = error.details.map(el => el.message)
     next(new appError(msg, 404))
 
 
    }else{
        next()
    }
} catch (error) {
    next(new appError(error, 404))
}
  
 }
 const isFunctionWorking = (req,res,next) =>{
        console.log("this is working")
        next
 }

 const isloggedin = (req,res,next) => {
try {
    if (!req.isAuthenticated()){

        req.flash('error', 'you must be logged in')
        res.redirect('/user/login')


    }else{
        next()
    }
} catch (error) {
    console.log(error)
    next(new appError(error, 404))
}
    
}

const ispro = (req,res,next) => {
try {
    

    if(req.user.isProfessional){

        next()
        
    } else{
        req.flash('error', 'sorry you are not a professional.')
        res.redirect('/cards')
    }
} catch (error) {
    console.log(error)
    next(new appError(error, 404))   
}


}

const isCardCreator =  async (req,res,next) => {

    try {
        const {id} = req.params
 const cards = await Card.findById(id)
 const originalUserId = cards.user._id

 const nowUserId = req.user._id

 if(JSON.stringify(originalUserId) == JSON.stringify(nowUserId)){

    next()
 }
else{

    req.flash('error', 'you are not the orignial creator')
    res.redirect('/cards')
}
    } catch (error) {
        console.log(error)
        next(new appError(error, 404))
    }

 

}

const isCardCreated = (req,res,next) => {
try {
    if(!req.user.isCardCreated){

        next()

    } else{
        req.flash('error','you already created one card')
        res.redirect(`/cards/${req.user.card}`)
    }
} catch (error) {
    next(new appError(error, 404))
}

   

}

const isReviewCreator = async (req,res,next) => {
try {
    const reviewId = req.params.reviewid
    const review = await Review.findById(reviewId)
    const currentUserId = req.user._id
    const originalUserId = review.user
    console.log(originalUserId)
    if(JSON.stringify(currentUserId) == JSON.stringify(originalUserId)) {

        next()
    }
    else{
        req.flash('error', 'you do not have permission to do that :(')
        res.redirect('/cards')
    }
} catch (error) {
    next(new appError(error, 404))
}
   

}

route.get('/test' , (req,res)  => {


    res.send('this is working')
})
route.get('/', async (req,res) => {
    
    const cards = await Card.find({})
    res.render('allcards',{cards})
})

route.get('/new',isloggedin,ispro,isCardCreated, (req,res) =>{

res.render('newcard')

})

route.post('/new',isloggedin,upload.array('image'),cardvalidator,ispro,isCardCreated, async(req,res) => {
    try {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.location,
            limit: 1
        }).send()
        const body = req.body
      const cards = new Card(body)
        cards.user = req.user._id
        const user1 = await User.findById(req.user._id)
        const image = req.files.map(f => ({ url: f.path, filename: f.filename }));
        cards.geometry = geoData.body.features[0].geometry;
        cards.image = image
        user1.isCardCreated = true
        user1.card = cards._id
        await user1.save()
        await cards.save()
    
      res.redirect('/cards/') 
    } catch (error) {
        next(new appError(error, 404))
    }
    
})



route.get('/:id', async (req,res,next) => {
    try {
        const {id} = req.params
    const cards = await Card.findById(id).populate({path: 'reviews', 
    populate: {path: 'user'
        }
})
res.render('showcard',{cards})
    } catch (error) {
        next(new appError(error.msg, 500))
    }
    
    
})


route.delete('/:id',isloggedin,ispro,isCardCreator,async (req,res,next) => {
try {
    const {id} = req.params
   const cards = await Card.findById(id)
    reviewArray = cards.reviews
    for (let i = 0; i < reviewArray.length; i++) {
      await  Review.findByIdAndDelete(reviewArray[i])
        
    }
    await Card.findByIdAndDelete(id)
    const user = await User.findById(req.user._id)
    user.isCardCreated = false
    delete user.card
    await user.save()
        req.flash('success', 'successfully deleted the your card')
     res.redirect('/bids/all')
  
} catch (error) {
    next(appError(error, 404))
}
    

})
route.get('/:id/edit',isloggedin,ispro,isCardCreator, async (req,res,next) => {
    try {
        const {id} = req.params
    const cards = await Card.findById(id)
res.render('cardedit', {cards})
    } catch (error) {
        next(new appError(error, 404))
    }
    

})


route.put('/:id/edit',cardvalidator,isloggedin,ispro,isCardCreator, async (req,res,next) => {
try {
    const {id} = req.params
    body = req.body
    await Card.findByIdAndUpdate(id,body)
    res.redirect(`/cards/${id}/`)
} catch (error) {
    next(new appError(error, 404))   
}

 
})


route.post('/fuzzy', async (req,res,next) => {

    const cards = await Card.fuzzySearch(req.body.search)
        res.render('cardsfuzzy',{cards})

    
})


route.post('/:id/reviewnew',isloggedin,async (req,res) => {
try {
    const {id} = req.params

const camp = await Card.findById(id)
const review = new Review(req.body)
review.user = req.user._id
camp.reviews.push(review._id)
await review.save()
await camp.save()
res.redirect(`/cards/${id}`)

} catch (error) {
    next(new appError(message, 404))
}

})

route.delete('/:id/review/:reviewid',isloggedin,isReviewCreator,async (req,res,next) => {

try {
    const cardId = req.params.id
    const reviewId = req.params.reviewid


    await Card.findByIdAndUpdate(cardId, {$pull : {reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    flash('success', 'successfully deleted the review')
    res.redirect(`/cards/${cardId}`)

} catch (error) {
    next( new appError(error, 404))
}
    

})

module.exports.cardsRouter = route


