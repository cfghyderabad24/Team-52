const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Donor = require("./models/donor");
mongoose.connect('mongodb://127.0.0.1:27017/jaldhara')
.then(() => {
    console.log("Connection Successful!!")
})
.catch((err) => {
    console.log("Error",err)
})
const passport = require("passport");
const User = require("./models/user");
const LocalStrategy = require("passport-local");
const expressSession = require("express-session");
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));

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

app.get("/home",(req,res) => {
    if(req.isAuthenticated())
    {
        let result = []
        res.render("home",{result})
    }
    else
    throw new Error("You are not logged in..")
})

app.get("/home/city/:cityName",async (req,res,next)=> {
     const {city,cityName} = req.params;
     console.log(cityName);
     let result = []

     const allDonors = await Donor.find({});
     for(let donor of allDonors)
     {
        let donorCities = donor.geographiesOfInterest;
        for(let donorCity of donorCities)
        {
            console.log(cityName,donorCity,cityName == donorCity);
            if(cityName == donorCity)
            {
                result.push(donor);
            }
            
        }
     }
     console.log(result);
     res.render("home",{result});
}) 









app.get("/login",(req,res) => {
    res.render("login.ejs");
})

app.post("/login",passport.authenticate("local",{failureFlash:true,failureRedirect:"/home"}),(req,res) => {
    res.redirect("/home")
})

app.get("/register",(req,res) => {
    res.render("register.ejs");
})

app.post("/register",async (req,res) => {
    try {
    console.log(req.body);
    const {username,email,password} = req.body;
    const user = new User({email,username});
    await User.register(user,password);
    res.redirect("/login");
    }
    catch(e)
    {
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






































app.post("/sendemail", (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 400, error: 'Email is required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Thank You for Your Order",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dcdcdc; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Thank You for Your Order!</h2>
                    <p>Dear Customer,</p>
                    <p>Thank you for ordering from our website. We are pleased to confirm your order and provide you with the details below.</p>
                    <h3 style="color: #555;">Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                        </tr>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">Subtotal</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">$200.00</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">Tax</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">$20.00</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Total</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>$220.00</strong></td>
                        </tr>
                    </table>
                    <p>We hope you enjoy your purchase! If you have any questions or need further assistance, please do not hesitate to contact us.</p>
                    <p>Best regards,</p>
                    <p>Your Company Name</p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error" + error);
                res.status(500).json({ status: 500, error });
            } else {
                console.log("Email sent:" + info.response);
                res.status(201).json({ status: 201, info });
            }
        });
    } catch (error) {
        console.log("Error" + error);
        res.status(500).json({ status: 500, error });
    }
});
app.use((err,req,res,next) => {        
    res.send("Error");
})
app.listen(3000,() => {
    console.log("Listening from port 3000");
})











