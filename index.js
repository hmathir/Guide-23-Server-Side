const express = require('express');
const cors = require('cors');
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

app.get('/services', async (req, res) => {
    const query = req.query.limit || 0;
    const cursor = serviceCollection.find({});
    const services = await cursor.limit(parseInt(query)).toArray();
    res.send(services);
})

app.get('/services/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
})

app.get('/reviews', async (req, res) => {
    const serviceId = req.query.serviceId;
    const reviewerEmail = req.query.reviewerEmail;

    let query;
    if(serviceId){
        query = {serviceId: serviceId};
    }
    else{
        query = {reviewerEmail: reviewerEmail};
    }

    const reviews = await reviewsCollection.find(query).toArray();
    res.send(reviews);
})

app.post('/reviews', async (req, res) => {
    const reviewDetails = req.body;
    const result = await reviewsCollection.insertOne(reviewDetails);
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

app.listen(port, () => {
    console.log(`App listening at ${port}`);
});
