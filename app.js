const express = require('express')
const engine = require('ejs-mate')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const path = require('path')
const Bid = require('./models/bid')
const { resourceLimits } = require('worker_threads')
const bid = require('./models/bid')


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


app.get('/bidsopen', async (req,res) => {
    const bids = await Bid.find({})

    res.render('bidsopen', {bids})
})


app.get('/bidsall', async (req,res) => {
    const bids = await Bid.find({})
    res.render('bidsall', {bids})
})

app.get('/bids/new', (req,res) => {
    res.render('new')
})

app.post('/bids/new', async (req,res) => {
    const body = req.body;

    const bids = new Bid(req.body)
   await bids.save()
    res.redirect(`/bids/${bids._id}`)



})

app.get('/bids/:id' , async (req,res) => {

    const id = req.params.id;
    const bids = await Bid.findById(id)

   res.render('show', {bids})
})

app.delete('/bids/:id', async (req,res) => {

    const id = req.params.id;
    const bids = await Bid.findByIdAndDelete(id)
res.redirect('/bids')

})


app.get('/bids/:id/edit', async (req,res) => {
    const id = req.params.id;
    const bids = await Bid.findById(id)

    res.render('edit',{bids})
})
// app.put('/bids/:id', (req,res) => {



// })

app.post('/bids/:id/submitbid', async (req,res) => {

const id = req.params.id;
const bids = await Bid.findById(id)

if(bids.highestBidder){

    const {highBidderName, highPrice} = req.body
    const previousName = highBidderName
    const previousPrice = highPrice
    
    bids.highestBidder = req.body

    bids.previousBidders.push({previousName,previousPrice})

    bids.save()

}else{

    bids.highestBiddeer = req.body
    bids.save()
}
res.redirect(`/bids/${id}`)

})



app.post('/bids/:id/closebid',async (req,res) => {

    const id = req.params.id
    const bids = await Bid.findByIdAndUpdate(id, { $set: { previousBidders: [] }})
    bids.isClosed = true
    await bids.save()
    res.redirect(`/bids/${id}`)
    
})