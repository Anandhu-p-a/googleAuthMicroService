const express = require("express");
const jwt = require("jsonwebtoken")
const { connection } = require("./configs/mongoose.connection");
const { UserModel } = require("./models/user.model");
const app = express();
const cors = require("cors")
require("dotenv").config();
const port = process.env.PORT || 8000;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {passport} = require("./configs/google.oAuth")

app.use(cors());

app.get("/",async(req,res)=>{
    try {
        let data = await UserModel.find()
        res.send(data)
    } catch (error) {
        console.log(error)
    }
})

//google auth starts here...............


app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {

       
        failureRedirect: '/login', //for separate frontend , redirect to login page
        session:false //we are not using session, if you want to use session you can remove this.
}),
async (req,res)=>{

    //console.log(req.user)__________________________________________________________________
    
    let userExists = await UserModel.findOne({email:req.user.email})
    
    if(!userExists){
        console.log("new user-----------------")
        //create new user in Database
        await UserModel.create(req.user);
        userExists = await UserModel.findOne( {email:req.user.email })
    }
    //_____use user data and attach authToken__________________________________________________________________________________
        const  token = jwt.sign({  user: userExists  }, process.env.JWT_SECRET);
        res.cookie("authToken",token)
        
    //redirect user to home page (frontend)_______________________________________________________________________________________
    res.redirect(`${process.env.frontendDeployedLink}?t=${token}`) //redirect to any page




}

);




//google auth ends here...............




app.listen(8000,async()=>{
    try {
        await connection
        console.log("connected to remote database.")
    } catch (error) {
        
    }
    console.log(`app started @ http://localhost:${port}`)
})