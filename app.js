if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express')
const engine = require('ejs-mate')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const path = require('path')
const Bid = require('./models/bid')
const { resourceLimits } = require('worker_threads')
const bid = require('./models/bid')
const appError = require('./utils/appError')
const {formValidation} = require('./joiValidation/validationSchema')
const session = require('express-session')
const flash = require('express-flash')
const {bidsRouter} = require('./routes/bids')
const passport = require('passport')
const localStatergy = require('passport-local')
const User = require('./models/Users')
const {userRouter} = require('./routes/users')
const {cardsRouter} = require('./routes/cards')

const app = express();

//methodoverride
app.use(methodOverride('_method'))

// connection to mongoose
mongoose.connect('mongodb://localhost:27017/konect').then(() => {
    console.log('connected to the mongodb')
}).catch(() => {
    console.log('cannot open the connection to mongoose for some reason')
})

//session configuration
app.use(
    require("express-session")({
      secret: "shibas are the best dogs in the world.",
      resave: false,
      saveUninitialized: false
    })
  );
  
  //flash configuration
  app.use(flash())

  
//passport configuration
passport.use(new localStatergy(User.authenticate()))
app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())


//setting up res.locals
app.use((req,res,next) =>{

res.locals.success = req.flash('success')
res.locals.error = req.flash('error')
res.locals.isUser = req.user
next()

})

//setting static file

app.use(express.static('./public'))

//url parser
app.use(express.urlencoded({extended: true}))


// views directory
app.engine('ejs', engine);
 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')


// setting up routes

app.use('/bids',bidsRouter)
app.use('/user', userRouter)
app.use('/cards', cardsRouter)
//listen to incoming connection

app.listen(3000, () => {
    console.log("started to listen on the port 3000")
})

app.get('/', (req,res) => {

    res.send('not yet done')
})

app.get('*', (req,res) => {

    res.render('notfound')
})

app.use((err,req,res,next)=> {

    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })

})