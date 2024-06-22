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



const emailList = [
    "sharansaitelukula@gmail.com",
    "srbdvaishnavi777@gmail.com",
    "avinaasha382@gmail.com"
];

app.post('/sendemail', async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            subject: 'Jaldhaara: Our Work and Impact',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dcdcdc; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Jaldhaara: Our Work and Impact</h2>
                    <p style="font-size: 16px; color: #555;">Dear Donor,</p>
                    <p style="font-size: 16px; color: #555;">We are excited to share with you the impactful work that Jaldhaara has been doing in the areas of water, sanitation, and hygiene. Here are some highlights of our recent projects:</p>
                    
                    <h3 style="color: #555; margin-top: 20px;">Our Projects</h3>
                    <div style="text-align: center;">
                        <img src="http://jaldhaara.org/wp-content/uploads/2022/05/IMG3-1024x576.png" alt="Project Image 1" style="width: 100%; height: auto; margin-bottom: 15px; border-radius: 5px;">
                        <img src="http://jaldhaara.org/wp-content/uploads/2022/05/IMG2-1024x576.png" alt="Project Image 2" style="width: 100%; height: auto; margin-bottom: 15px; border-radius: 5px;">
                        <img src="http://jaldhaara.org/wp-content/uploads/2022/04/sanitation-and-hygiene-left-scaled.jpg" alt="Project Image 3" style="width: 100%; height: auto; margin-bottom: 15px; border-radius: 5px;">
                        <img src="http://jaldhaara.org/wp-content/uploads/2022/04/simg_2.jpg" alt="Project Image 4" style="width: 100%; height: auto; margin-bottom: 15px; border-radius: 5px;">
                    </div>
                    
                    <p style="font-size: 16px; color: #555;">We have also created a short video to showcase our initiatives and their impact on communities:</p>
                    <div style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
                        <a href="https://youtu.be/pcijf4Lhrn0?si=LtiAX4vFjGKETrTb" style="display: inline-block; text-decoration: none;">
                            <img src="https://via.placeholder.com/600x400.png?text=Watch+Our+Video" alt="Video Placeholder" style="width: 100%; height: auto; border-radius: 5px;">
                        </a>
                    </div>
                    
                    <p style="font-size: 16px; color: #555;">Thank you for your continued support. Together, we can make a significant difference in improving access to clean water and sanitation.</p>
                    
                    <p style="font-size: 16px; color: #555;">Best regards,</p>
                    <p style="font-size: 16px; color: #555;">The Jaldhaara Team</p>
                </div>
            `,
        };

        // Loop through the predefined email list and send emails
        for (let email of emailList) {
            mailOptions.to = email;
            await transporter.sendMail(mailOptions);
        }

        res.status(201).json({ status: 201, message: 'Emails sent successfully' });
    } catch (error) {
        console.log("Error" + error);
        res.status(500).json({ status: 500, error });
    }
});



app.use((err, req, res, next) => {
    res.send("Error");
})
app.listen(3000, () => {
    console.log("Listening from port 3000");
})