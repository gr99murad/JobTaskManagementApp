const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// Middleware
app.use(cors());
app.use(express.json());

const uri = (`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c4vcn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // database collection
    const taskCollection = client.db('taskManager').collection('tasks');
    // store user details in database
    const usersCollection = client.db('taskManager').collection('users');

    app.post('/users',async(req,res) => {
      const { uid, email, displayName} = req.body;

      if(!uid || !email || !displayName){
        return res.send({message: "Missing required user details"});
      }

      const filter = { uid: uid};
      const updateDoc = {
        $set: {
          uid,
          email,
          displayName,
          lastLogin: new Date(),
        },
      };
      const options = { upsert: true};
      const result = await usersCollection.updateOne(filter, updateDoc,options);

      res.send(result);
    })
    // create a task
    app.post('/tasks', async(req,res) => {
      const task = req.body;
      task.timestamp = new Date();
      task.order = 0; // initial order
      const result = await taskCollection.insertOne(task);
      res.send(result);
    })
    // get all tasks
    app.get('/tasks',async(req,res) => {
        try{
            const tasks = await taskCollection.find().toArray();
            res.send(tasks);
        }catch(error){
            console.error("Error fetching tasks:", error);
            res.send({ error: 'Failed to fetch tasks'});
        }
    });

    //update a task
    app.put('/tasks/:id', async(req,res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: new ObjectId(id)};
      const updateDoc = { $set: updatedTask};
      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    

    // delete task
    app.delete('/tasks/:id', async(req, res) => {
      const id = req.params.id;
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id)});
      res.send(result);
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req, res) => {
    res.send('Job Task Management App')

})

app.listen(port, () =>{
    console.log(`Running at : ${port}`)
})