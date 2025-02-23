require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://job-flow-task.netlify.app',
        'https://a11-job-task-server.vercel.app',
    ],
    credentials: true,
}))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.faeap.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const userCollection = client.db("jobTaskDb").collection("userInfo");
        const taskCollection = client.db("jobTaskDb").collection("allTask");

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // userInfo post
        app.post('/users', async (req, res) => {
            const user = req.body;
            // insert email if user dosent exist
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user alrady exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        // add all task
        app.post('/addTask', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task)
            res.send(result)
        })

        // task get
        app.get('/taskCategory/:category', async (req, res) => {
            const category = req.params.category
            const query = { category: category }
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/addTask', async (req, res) => {
            const result = await taskCollection.find().toArray()
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from job flow Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
