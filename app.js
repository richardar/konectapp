const express = require('express')
const engine = require('ejs-mate')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const path = require('path')
const Bid = require('./models/bid')


const app = express();

//methodoverride
app.use(methodOverride('_method'))

// connection to mongoose
mongoose.connect('mongodb://localhost:27017/konect').then(() => {
    console.log('connected to the mongodb')
}).catch(() => {
    console.log('cannot open the connection to mongoose for some reason')
})

//url parser
app.use(express.urlencoded({extended: true}))


// views directory
app.engine('ejs', engine);
 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

//listen to incoming connection

app.listen(3000, () => {
    console.log("started to listen on the port 3000")
})


app.get('/', async (req,res) => {
    const bids = await Bid.find({})

    res.render('index', {bids})
})

app.get('/new', (req,res) => {
    res.render('new')
})

app.post('/new', async (req,res) => {
    const body = req.body;

    const bids = new Bid(req.body)
   await bids.save()
    res.send(req.body)



})

app.get('/:id', async (req,res) => {
    const {id = NaN} = req.params;
    console.log(req.params)
   console.log(id)
    
    const bids = await Bid.findById()
    res.render(bids)

})