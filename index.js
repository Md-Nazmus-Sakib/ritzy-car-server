const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;



// middle wear

// app.use(cors())
// app.use(express.json());
// const corsOptions = {
//     origin: '*',
//     credentials: true,
//     optionSuccessStatus: 200,
// }

app.use(express.json());
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}
app.use(cors(corsConfig))


//user:ritzy-car-db
//pass:EBfDH6YkQYCnQ1lg

const uri = ` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.91makds.mongodb.net/?retryWrites=true&w=majority`;

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
        const brandsCollection = client.db("ritzy-carDb").collection("brands");
        const productsCollection = client.db("ritzy-carDb").collection("products");
        const cartsCollection = client.db("ritzy-carDb").collection("carts");
        const imagesCollection = client.db("ritzy-carDb").collection("images");

        app.get('/images', async (req, res) => {
            const result = await imagesCollection.find().toArray();
            res.send(result)
        })
        app.get('/brands', async (req, res) => {
            const result = await brandsCollection.find().toArray();
            res.send(result)
        })
        //get brand name by click the brand
        app.get('/brands/:brandsName', async (req, res) => {
            const brandName = req.params.brandsName;
            const query = { brandName: brandName }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })
        //get product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result)
        })
        //Add Product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;

            const result = await productsCollection.insertOne(newProduct);
            res.send(result)
        })
        // update product 
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateProduct = req.body;
            const product = {

                $set: {
                    brandName: updateProduct.brandName,
                    modelName: updateProduct.modelName,
                    category: updateProduct.category,
                    price: updateProduct.price,
                    rating: updateProduct.rating,
                    img: updateProduct.img,
                    description: updateProduct.description,
                }
            }
            const result = await productsCollection.updateOne(filter, product, options);
            res.send(result)

        })

        // cart collection
        app.get('/carts', async (req, res) => {
            const result = await cartsCollection.find().toArray();
            res.send(result)
        })

        //add db a cart
        app.post('/carts', async (req, res) => {
            const item = req.body;
            const query = { userEmail: item.userEmail, productId: item.productId }
            const exist = await cartsCollection.findOne(query);
            console.log(exist)
            if (exist) {
                return res.send('already exist')
            }
            else {
                const result = await cartsCollection.insertOne(item);
                res.send(result)
            }
        })

        //Delete a cart
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartsCollection.deleteOne(query);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }

    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('Ritzy-car-Server is Running')
})

app.listen(port, () => {
    console.log(`Ritzy-car-Server is running on port: ${port}`)
})
