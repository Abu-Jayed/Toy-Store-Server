const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;



/* sir ans start */
const corsConfig = {
origin: '*',
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("*", cors(corsConfig))
/* sir ans end */


app.use(express.json());


/* code from mongobd start */

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pwifs1n.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyHeroDB").collection("toyCollection");


    /* search code  */
    const indexKeys = { name: 1, category: 1 }; 
    const indexOptions = { name: "toyCategory" }; 

    /* search toy code here */
app.get("/getToyByName/:text", async (req, res) => {
  const text = req.params.text;
  const result = await toyCollection
    .find({
      $or: [
        { name: { $regex: text, $options: "i" } },
        { category: { $regex: text, $options: "i" } },
      ],
    })
    .toArray();
  res.send(result);
});

    

    /* find all data */
    app.get("/allToy", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    /* show limited data */
    app.get("/allToy/:limit", async (req, res) => {
      // console.log(req.params.limit);
      const toyLimit = parseInt(req.params.limit)
      const cursor = toyCollection.find().limit(toyLimit);
      const result = await cursor.toArray();
      res.send(result);
    });

    /* find marvel single data by sub category */
    app.get("/allToy/Marvel/:Her", async (req, res) => {
        const query = {subCategory: req.params.Her,category: "Marvel"}
        const cursor = toyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

    /* find DC single data by sub category */
    app.get("/allToy/DC/:Her", async (req, res) => {
        const query = {subCategory: req.params.Her,category: "DC"}
        const cursor = toyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

    /* find HarryPoter single data by sub category */
    app.get("/allToy/Harry/:Her", async (req, res) => {
        const query = {subCategory: req.params.Her,category: "Harry Potter"}
        const cursor = toyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

    
/* find data for view details page */

app.get("/details/:id", async (req, res) => {
    const id = req.params.id
    const query = {_id: new ObjectId(id)}
    const cursor = toyCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  });
    

  /* add toy start */
  app.post("/addToy", async (req, res) => {
    const body = req.body;
    body.createdAt = new Date();
    // console.log(body);
    const result = await toyCollection.insertOne(body);
    if (result?.insertedId) {
      return res.status(200).send(result);
    } else {
      return res.status(404).send({
        message: "can not insert try again leter",
        status: false,
      });
    }
  });
  /* add toy end */

/* show my toy page code start  */
app.get("/myToys/:email", async (req, res) => {
  // console.log('email',req.params.email);
  // console.log( 'query',req.query.grow);
  const sortObj = {}
  if(req.query.grow === 'yes'){
    sortObj.a=1
  }else{
    sortObj.a=-1
  }
  const sortWith = sortObj.a;
  // console.log('sortWith',sortWith);
  // console.log('sortObj',sortObj);
  const toys = await toyCollection
    .find({
      postedBy: req.params.email,
    })
    .sort({price: sortWith})
    .toArray();
  res.send(toys);
});
/* show my toy page code end */


/* update toy start */
app.put("/updateToy/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  // console.log(body);
  const filter = { _id: new ObjectId(id) };
  console.log('id',id);
  console.log('body',body);
  console.log('filter',filter);
  const updateDoc = {
    $set: {
      name: body.name,
      rating: body.rating,
      category: body.category,
      price: body.price,
      available_quantity: body.available_quantity,
    },
  };
  const result = await toyCollection.updateOne(filter, updateDoc);
  res.send(result);
});
/* update toy end */

/* delete code start */

app.delete('/toys/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await toyCollection.deleteOne(query);
  res.send(result);
})

/* delete code end */

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

/* code from mongobd end */

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
