const express = require('express');
const { ApolloServer, PubSub } = require('apollo-server-express');
const path = require('path');
const mongoose = require('mongoose')
const http = require('http');
const { makeExecutableSchema } = require("graphql-tools")
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge")
const { loadFilesSync } = require("@graphql-tools/load-files")
require('dotenv').config();
const  {authCheckMiddleware} = require('./helpers/auth');
const cors = require('cors')
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary');



const pubsub = new PubSub()

// express server
const app = express();

// db
const db = async () => {
    try {
        const success = await mongoose.connect(process.env.DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('DB Connected!');
    } catch (error) {
        console.log('Db connection error', error);
    }
};

//execute database connection
db();

//midlewares
app.use(cors());
app.use(bodyParser.json({limit: '5mb'}));

// usage
const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, "./typeDefs")));
const resolvers = mergeResolvers(
    loadFilesSync(path.join(__dirname, "./resolvers"))
);


// graphql server

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req }) => ({req, pubsub})
});

// applyMiddleware method connects ApolloServer to a specific HTTP framework ie:express
apolloServer.applyMiddleware({ app });

// server
const httpserver = http.createServer(app)
apolloServer.installSubscriptionHandlers(httpserver);

// Rest endpoint
app.get('/rest', authCheckMiddleware, function (req, res) {
    res.json({
        data: 'you hit rest endpoint great'
    });
});



// cloudinary config 
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

//upload
app.post('/uploadimages', authCheckMiddleware, (req,res) => {
    cloudinary.uploader.upload(req.body.image, result => {
        console.log(result);
        res.send({
            url: result.secure_url,
            public_id: result.public_id
        })
    }, {
        public_id: `${Date.now()}`, // Public name
        resource_type: 'auto' // JPEG,PNG...
    });
})

// REMOVE IMAGE
app.post('/removeimage', authCheckMiddleware,(req,res) => {
    let image_id = req.body.public_id

    cloudinary.uploader.destroy(image_id, (error, result )  => {
        if(error) return res.json({success: false, error});
        res.send('ok');
    });
});

// Port
httpserver.listen(process.env.PORT, function () {
    console.log(`server is ready at http://localhost:${process.env.PORT}`);
    console.log(`graphql server is ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`);
    console.log(`subscription  is ready at http://localhost:${process.env.PORT}${apolloServer.subscriptionsPath}`);

});