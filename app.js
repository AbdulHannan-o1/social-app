const express = require('express');
const app = express();
const connectDB = require('./config/db');
const upload = require('./config/multerConfig')

connectDB();

const userModel = require('./models/user');
const postModel = require('./models/posts');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const path = require('path');
const crypto = require('crypto')

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/partials')]);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());



app.get('/', (req, res) => {
    res.render('index');
});

app.get('/profileUpload', (req, res) => {
    res.render("profileUpload")
})

app.post('/profileUpload', isLoggedIn,  upload.single("image"), async (req, res) => {
    try {
    let user = await userModel.findOne({email: req.user.email})
    user.profilePic.data = req.file.buffer
    user.profilePic.contentType = req.file.mimetype
    await user.save()
    console.log("Saved image size:", req.file.buffer.length);
    res.redirect('/profile')
    } catch (err) {
        res.status(500).json({message: "Error uploading image"})
    }
})
app.get('/user/:id/profile-pic', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user || !user.profilePic || !user.profilePic.data) {
      console.log('⚠️ No profile pic found for user:', req.params.id);
      return res.status(404).send('No profile picture found');
    }

    res.set('Content-Type', user.profilePic.contentType);
    res.end(user.profilePic.data);
  } catch (err) {
    console.error('❌ Error serving image:', err);
    res.status(500).send('Server error while fetching image');
  }
})

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
                res.redirect('/profile')
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
        if(result) {

             let token = jwt.sign({ email: email, userid: user._id }, "shhhhh");
             res.cookie("token", token);
             res.redirect("/profile");
        }
        else return res.status(201).send("invalid Credentials")
    })
});

app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email});
    let allPosts = await postModel.find().populate("user").populate("comments.author");
    res.render("profile", { user, allPosts });
});

app.get('/like/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("user")

    if(post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid)
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }
    await post.save()
    res.redirect('/profile')
});

app.get('/edit/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id});
    res.render("edit", {post},)
});


app.post('/post/:id/comment', isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id)
    if (!post) return res.status(404).send('Post not found')

    post.comments.push({
      text: req.body.commentText,
      author: req.user._id
    })

    await post.save()
    console.log(post.comments[post.comments.length - 1])

    res.redirect('/profile')
  } catch (err) {
    console.error(err)
    res.status(500).send('Something went wrong while adding the comment!')
  }
})
app.get('/post/:id', isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id)
      .populate('author')
      .populate('comments.author')

    if (!post) return res.status(404).send('Post not found')

    res.render('post', { post }) // make sure you have a post.ejs or similar
  } catch (err) {
    console.error(err)
    res.status(500).send('Something went wrong while fetching the post!')
  }
})



app.post('/update/:id', isLoggedIn, async (req, res)=> {
    let {content} = req.body
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content})
    res.redirect('/profile')
})

app.post('/post', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email})
    let {content} = req.body

    let post = await postModel.create({
        user: user._id,
        content,
        
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})

// checking for authenricated user 
function isLoggedIn (req,res, next) {
    if(req.cookies.token === "") res.redirect("/login");
    else {
        let data = jwt.verify(req.cookies.token, "shhhhh")
        req.user = data;
    }   
    next()
}

app.get('/logout', (req, res) => {
    res.cookie('token', "")
    res.redirect('/login')  
});

// app.listen(3000);
module.exports = app;
