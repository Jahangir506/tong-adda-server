const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5007;

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.mongoDB_PASS}@cluster0.ye7c1vr.mongodb.net/?retryWrites=true&w=majority`;

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
    //   await client.connect();

    // collection
    const serviceCollection = client.db("tong_adda").collection("services");
    const bookingCollection = client.db("tong_adda").collection("bookings");
    const addServiceCollection = client
      .db("tong_adda")
      .collection("addService");
    const userCollection = client.db("tong_adda").collection("user");

    // auth jwt 
    // app.post('/jwt', async(req, res)=> {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.TOKEN, {expiresIn: '7h'});
    //   res
    //   .cookie("token", token, {
    //     httpOnly: true,
    //     secure: false
    //   })
    //   .send({message: true });
    // })

    //    get services
    app.get("/services", async (req, res) => {
      try {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // get search multiple service

    // get single service
    app.get("/services/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const options = {
          projection: {
            _id: 1,
            service_image: 1,
            service_name: 1,
            service_description: 1,
            service_price: 1,
            service_provider: 1,
          },
        };
        const result = await serviceCollection.findOne(query, options);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // get specific email by booking service
    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

     // get specific email by add service
     app.get("/addService", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await addServiceCollection.find(query).toArray();
      res.send(result);
    });

    // get addService update 
    app.get("/addService/update/:id", async (req, res) => {
     const id = req.params.id;
     const query = {_id: new ObjectId(id)}
     const result = await addServiceCollection.findOne(query);
     res.send(result)
    });

    // post booking service
    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // post add service
    app.post("/addService", async (req, res) => {
      try {
        const addService = req.body;
        const result = await addServiceCollection.insertOne(addService);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // patch request confirm service
    app.patch('/addService/request/confirm/:id', async (req, res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
     
      const updatedAddService = req.body;
      console.log(updatedAddService);

      const updateDoc = {
        $set: {
          status: updatedAddService.status
        },
      };

      const result = await addServiceCollection.updateOne(filter, updateDoc)
      res.send(result)

    })

    // put specific add service update 
    app.put('/addService/update/:id', async(req, res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const addServiceUpdate = req.body;
      const addService = {
        $set: {
          pictureURL: addServiceUpdate.pictureURL,
          serviceName: addServiceUpdate.serviceName,
          yourName: addServiceUpdate.yourName,
          yourEmail: addServiceUpdate.yourEmail,
          serviceArea: addServiceUpdate.serviceArea,
          price: addServiceUpdate.price,
          description: addServiceUpdate.description
        }
      }
      const result = await addServiceCollection.updateOne(filter, addService, options);
      res.send(result)
    })

    // delete add service 
    app.delete('/addService/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await addServiceCollection.deleteOne(query);
      res.send(result)
    })

    // delete bookings service 
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result)
    })

    // app.delete("/bookings/:id", async(req, res)=>{
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)};
    //   const result = await bookingCollection.deleteOne(query)
    //   res.send(result)
    // })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("tong adda server is running");
});

app.listen(port, () => {
  console.log(`tong adda server is running port, ${port}`);
});
