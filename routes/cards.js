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




const cardvalidator = (req,res,next) => {

    const {error} = cardsValidation.validate(req.body)
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

const ispro = (req,res,next) => {


    if(req.user.isProfessional){

        next()
        
    } else{
        req.flash('error', 'sorry you are not a professional.')
        res.redirect('/cards')
    }


}

const isCardCreator =  async (req,res,next) => {

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

}

route.get('/test' , (req,res)  => {


    res.send('this is working')
})
route.get('/', async (req,res) => {
    
    const cards = await Card.find({})
    res.render('allcards',{cards})
})

route.get('/new',isloggedin,ispro, (req,res) =>{

res.render('newcard')

})

route.post('/new',isloggedin,cardvalidator,ispro,async (req,res) => {

    const body = req.body
  const cards = new Card(body)
    cards.user = req.user._id
    const user1 = await User.findById(req.user._id)
    user1.isCardCreated = true
    user1.card = cards._id
    await user1.save()
    await cards.save()

  res.redirect('/cards/')  
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

    const {id} = req.params
    cards = await Card.findById(id)
    reviewArray = cards.reviews
    for (let i = 0; i < reviewArray.length; i++) {
      await  Review.findByIdAndDelete(reviewArray[i])
        
    }
    await Card.findByIdAndDelete(id)
    const user = await User.findById(req.user._id)
    user.isCardCreated = false
        req.flash('success', 'successfully deleted the your card')
     res.redirect('/bids/all')
  

})
route.get('/:id/edit',isloggedin,ispro,isCardCreator, async (req,res,next) => {
    const {id} = req.params
    const cards = await Card.findById(id)
res.render('cardedit', {cards})

})


route.put('/:id/edit',cardvalidator,isloggedin,ispro,isCardCreator, async (req,res,next) => {


    const {id} = req.params
    await Card.findByIdAndUpdate(id,res.body)
})

route.post('/:id/reviewnew',isloggedin,async (req,res) => {

const {id} = req.params

const camp = await Card.findById(id)
const review = new Review(req.body)
review.user = req.user._id
camp.reviews.push(review._id)
await review.save()
await camp.save()
res.redirect(`/cards/${id}`)

})

route.delete('/:id/review/:reviewid',async (req,res,next) => {


    const cardId = req.params.id
    const reviewId = req.params.reviewid


    await Card.findByIdAndUpdate(cardId, {$pull : {reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    flash('success', 'successfully deleted the review')
    res.redirect(`/cards/${cardId}`)


})

module.exports.cardsRouter = route


