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



app.use((err, req, res, next) => {
    res.send("Error");
})
app.listen(3000, () => {
    console.log("Listening from port 3000");
})