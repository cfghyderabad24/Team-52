const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Donor = require("./models/donor");
mongoose.connect('mongodb://127.0.0.1:27017/jaldhara')
    .then(() => {
        console.log("Connection Successful!!")
    })
    .catch((err) => {
        console.log("Error", err)
    })
const passport = require("passport");
const User = require("./models/user");
const LocalStrategy = require("passport-local");
const expressSession = require("express-session");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: "your secret key",
    resave: false,
    saveUninitialized: false
}));

//passport passport-local passport-local-mongoose



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/home", (req, res) => {
    if (req.isAuthenticated()) {
        let result = []
        res.render("home", { result })
    }
    else
        throw new Error("You are not logged in..")
})

app.get("/home/city/:cityName", async (req, res, next) => {
    const { city, cityName } = req.params;
    console.log(cityName);
    let result = []

    const allDonors = await Donor.find({});
    for (let donor of allDonors) {
        let donorCities = donor.geographiesOfInterest;
        for (let donorCity of donorCities) {
            console.log(cityName, donorCity, cityName == donorCity);
            if (cityName == donorCity) {
                result.push(donor);
            }

        }
    }
    console.log(result);
    res.render("searchBarLocation", { result });
})

app.get("/home/interest/:interestName", async (req, res, next) => {
    const interestName = req.params.interestName;
    let result = []
    const allDonors = await Donor.find({});

    for (let donor of allDonors) {
        if (donor.csrPolicy.interest == interestName) {
            result.push(donor);
        }
    }
    console.log(result);
    res.render("searchBarLocation", { result });

})










app.get("/login", (req, res) => {
    res.render("login.ejs");
})

app.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/home" }), (req, res) => {
    res.redirect("/home")
})

app.get("/register", (req, res) => {
    res.render("register.ejs");
})

app.post("/register", async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        await User.register(user, password);
        res.redirect("/login");
    }
    catch (e) {
        res.send(e.message);
    }
})

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/home');
    });
});






































app.get('/bot', (req, res) => {
    res.render('bot');
});

const { GoogleGenerativeAI } = require('@google/generative-ai');
const expressasynchandler=require('express-async-handler');
const axios = require('axios');
app.post('/generate-text',expressasynchandler( async (req, res) => {
    const plantName = req.body;
    let  x;
    for(let name in plantName)
        x=name
    console.log(x)
    try {
        // Initialize the Gemini model
        const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Replace with your actual API key
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate text based on the plantName entered
        const prompt = `Tell about ${x}($give it in the form of html tags$)(we only need the required info dont give usless stuff $(dont type html in the top)$)`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        // Send the generated text back to the client
        res.json({ generatedText: text });
    } catch (error) {
        console.error('Error occurred while generating text:', error);
        res.status(500).json({ error: 'Error occurred while generating text' });
    }
}));


app.use((err, req, res, next) => {
    res.send("Error");
})
app.listen(3000, () => {
    console.log("Listening from port 3000");
})