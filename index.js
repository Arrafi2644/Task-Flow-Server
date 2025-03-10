require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.duk9d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const taskCollection = client.db("task-flow").collection("tasks");
const userCollection = client.db("task-flow").collection("users");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.post('/users', async(req, res) => {
        const user = req.body;
        const query = {email : user?.email}
        const isExist = await userCollection.findOne(query)

        if(isExist){
            return res.send({message: "User already exist"})
        }
        const result = await userCollection.insertOne(user)
        res.send(result)
    })

    app.post('/tasks', async(req, res) => {
     const task = req.body;
     const result = await taskCollection.insertOne(task)
     res.send(result)
    })

    app.get('/tasks/:email', async(req, res) =>{
        const email = req.params.email;
        console.log(email);
        const query = {email: email};
        const result = await taskCollection.find(query).toArray()
        res.send(result)
    })


    app.delete('/tasks/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await taskCollection.deleteOne(query)
        res.send(result)
    })

    app.put('/tasks/:id', async(req, res) =>{
        const id = req.params.id;
        const task = req.body;
        const filter = {_id: new ObjectId(id)}
        const updatedTask = {
            $set: {
                title: task.title,
                description: task.description,
                timestamp: task.timestamp
            }
        }
        const result = await taskCollection.updateOne(filter, updatedTask)
        res.send(result)
    })

    app.put('/tasks/category/:id', async (req, res) => {
        const id = req.params.id;
        const { category } = req.body;  // ✅ Extract only category
    
        const filter = { _id: new ObjectId(id) };
        const update = {
            $set: { category }  // ✅ Update only the category field
        };
    
        const result = await taskCollection.updateOne(filter, update);
        res.send(result);
    });
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', async(req, res) => {
    res.send("Task Flow is running ")
})

app.listen(port, ()=>{
    console.log("Task Flow is running on port ", port);
})