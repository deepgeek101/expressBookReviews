const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization'];

    if (token && token.startsWith("Bearer ")) {
        const accessToken = token.split(" ")[1];
        // validate the token here if required
        next();
    } else {
        res.status(401).send("Unauthorized: No valid token provided");
    }
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/books", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
