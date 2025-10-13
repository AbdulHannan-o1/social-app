const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/posts');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/register', async (req, res) => {
    try {
        const { username, name, email, password, age } = req.body;

        let existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                return res.status(500).send("Error generating salt");
                console.log(err);
            }
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    return res.status(500).send("Error hashing password");
                    console.log(err);
                }
                const newUser = await userModel.create({
                    username,
                    name,
                    email,
                    password: hash,
                    age
                });
                // res.status(201).send("User registered successfully");
                let token = jwt.sign({ email: email, userid: newUser._id }, "shhhhh");

                res.cookie("token", token);
                res.send("registered")
            });
        });


    }
    catch (error) {
        console.log("Error creating User", error);
        res.status(500).send("Internal Server Error");
    }
})

app.post('/login', async (req, res) =>{
    let {email, password} = req.body;

    let user = await userModel.findOne({email})
    if(!user) return res.status(500).send("somthing went Wrong")
     
    bcrypt.compare(password, user.password,(err, result) => {
        if(result) return res.status(200).send("you can Login")
        else return res.status(201).send("invalid Credentials")
    })
});

app.get('/logout', (req, res) => {
    res.cookie('token', "")
    res.redirect('/login')  
});

app.listen(3000);