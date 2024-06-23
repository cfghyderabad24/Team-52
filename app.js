const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Donor = require("./models/donor");
const Individual = require("./models/individuals");
const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();
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
app.get("/", async (req, res) => {
    res.send("Welcome to Jaldhaara");

})

app.use((req, res, next) => {

    res.locals.currUser = req.user;
    next();
});

app.get("/home", async (req, res) => {
    if (req.isAuthenticated()) {
        let result = await Donor.find({});
        res.render("searchBarLocation", { result });
    }
    else
        throw new Error("You are not logged in..")
})

app.get("/home/:companyName", async (req, res) => {
    const company = await Donor.find({ companyName: req.params.companyName });
    console.log(company);
    const companyMail = company[0].email;
    res.redirect(`//${companyMail}`);
})

app.get("/home/city/:cityName", async (req, res, next) => {
    console.log("Inside city..")
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
    res.render("searchBarLocation.ejs", { result });

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


const emailList = [
    "sharansaitelukula@gmail.com",
    "srbdvaishnavi777@gmail.com",
    "avinaasha382@gmail.com"
];

app.post('/sendemail1', async (req, res) => {
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
                    <p style="font-size: 16px; color: #555;">Dear Company,</p>
                    <p style="font-size: 16px; color: #555;">We at Jaldhaara are seeking investment to scale our innovative service, and believe a partnership with your company could drive significant mutual growth. We have attached a video briefing the key points of our organization. Please let us know if you are willing to move forward with the proposal</p>
                    
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

        res.redirect("/home");
    } catch (error) {
        console.log("Error" + error);
        res.status(500).json({ status: 500, error });
    }
});

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




app.post('/sendemail2', async (req, res) => {
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
                    <p style="font-size: 16px; color: #555;">Dear Vishnu,</p>
                    <p style="font-size: 16px; color: #555;">Thanks for contributing to Jaldhaara and the money you spend was used to provide safe drinking water facilities to the district of Guntur. Thanks once again for your donation as every donation matters and creates an impact.</p>
                    
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

app.get('/logout', async (req, res, next) => {
    await req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/home");
    });
});



app.use((err, req, res, next) => {
    res.send("Error");
})

app.listen(3000, () => {
    console.log("Listening from port 3000");
})


app.post("/home", async (req, res) => {
    let { data } = req.body;
    console.log(data);
    res.redirect(`/home/city/${data}`);
})
app.get('/bot', (req, res) => {
    res.render('bot');
});

const { GoogleGenerativeAI } = require('@google/generative-ai');
const expressasynchandler = require('express-async-handler');
app.post('/generate-text', expressasynchandler(async (req, res) => {
    const plantName = req.body;
    let x;
    for (let name in plantName)
        x = name
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

app.get('/csr-companies', expressasynchandler(async (req, res) => {
    try {
        // Replace with the actual URL of the API providing CSR companies data
        const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Replace with your actual API key
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate text based on the plantName entered
        const prompt = `give the csr companies which are interested to fund ngo's for "WASH","clean water" projects(give the respones in $json$)`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        res.json({ generatedText: text });

    } catch (error) {
        console.error('Error occurred while fetching CSR companies data:', error);
        res.status(500).json({ error: 'Error occurred while fetching CSR companies data' });
    }
}));