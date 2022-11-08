const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server Running...');
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dmmiwed.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//Database Connected
const dbConnect = async () => {
    try {
        await client.connect();
        console.log('Server Connected');
    }
    catch (e) {
        console.log(e);
    }
}
dbConnect();

//Collections
const serviceCollection = client.db('guide23').collection('services');
const messagesCollection = client.db('guide23').collection('messages');
const reviewsCollection = client.db('guide23').collection('reviews');
const blogsCollection = client.db('guide23').collection('blogs');

//JWT
app.post('/jwt', (req,res)=>{
    const userData = req.body;
    const token = jwt.sign(userData, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
    res.send({token});
})


const verifyJWT = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'Unathorized Access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if(error){
            return res.status(401).send({message: 'Unathorized Access'});
        }
        req.decoded = decoded;
        next();
    })
}



//SERVICES
app.get('/services', async (req, res) => {
    const query = req.query.limit || 0;
    const cursor = serviceCollection.find({}).sort({_id:-1});
    const services = await cursor.limit(parseInt(query)).toArray();
    res.send(services);
})

app.post('/services', async (req, res) => {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    res.send(result);
})

app.get('/services/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
})

//REVIEWS
app.get('/reviews', verifyJWT, async (req, res) => {
    const decoded = req.decoded;
    if(decoded.email !== req.query.reviewerEmail){
        return res.status(403).send({message: 'Access Denied'});
    }
    const reviewerEmail = req.query.reviewerEmail;
    const query = {reviewerEmail: reviewerEmail};
    const reviews = await reviewsCollection.find(query).sort({_id:-1}).toArray();
    res.send(reviews);
})

app.get('/reviewsbyserviceid', async (req, res) => {
    const serviceId = req.query.serviceId;
    const query = {serviceId: serviceId};
    const reviews = await reviewsCollection.find(query).sort({_id:-1}).toArray();
    res.send(reviews);
})


app.post('/reviews', async (req, res) => {
    const reviewDetails = req.body;
    const result = await reviewsCollection.insertOne(reviewDetails);
    res.send(result);
})

app.patch('/reviews/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const reviewText = req.body;
    const result = await reviewsCollection.updateOne(query, {$set: reviewText});
    res.send(result);
})

app.get('/reviews/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const review = await reviewsCollection.findOne(query);
    res.send(review);
})

app.delete('/reviews/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewsCollection.deleteOne(query);
    res.send(result);
})

//message stored on messageCollection
app.post('/send-messages', async (req, res) => {
    const message = req.body;
    const result = await messagesCollection.insertOne(message);
    res.send({
        message: 'Message Sent Successfully',
        status: 200,
        data: result
    });
})

//BLOG

app.get('/blogs', async (req, res) => {
    const query = {};
    const cursor = blogsCollection.find(query);
    const blogs = await cursor.toArray();
    res.send(blogs);
})

app.listen(port, () => {
    console.log(`App listening at ${port}`);
});
