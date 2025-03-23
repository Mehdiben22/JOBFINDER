import express from "express";
import {auth} from "express-openid-connect"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
import fs from "fs";
import User from "./models/userModel.js";
import asyncHandler from "express-async-handler";


dotenv.config();


const app = express();

//config router for connection sing-in or sign-up with Auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials:true
}))

//setup midelwares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(auth(config));

//function to check if user exists on database after the signup or signin 
//from auth0
const ensureUserInDB = asyncHandler(async (user) => {
    try{
      const exisingUser = await User.findOne({auth0Id : user.sub});

      //condition if the user doesnt exists on the db
      if(!exisingUser) {
        //create a new user document
        const newUser = new User({
            auth0Id : user.sub,
            email : user.email,
            name : user.name,
            role : "jobseeker",
            profilePicture : user.picture
        });
       //save the user on our database
        await newUser.save();

        console.log("User added to db", user);
      } else {
        console.log("User already exists on the database", exisingUser);
      }
    }catch(error) {
        console.log("Error checking or adding user to db", error.message)
    }
});

app.get("/", async (req,res) => {
    if(req.oidc.isAuthenticated()) { 
        //check if authO user exits in the db
        await ensureUserInDB(req.oidc.user);



        //redirect to the frontend 
        return res.redirect(process.env.CLIENT_URL);
    } else {
        return res.send("Logged out");
    }
})

//routes
//reading routes files one by one
const routeFiles = fs.readdirSync("./routes");

routeFiles.forEach((file)=>{
    //import dynamic routes
    import(`./routes/${file}`).then((route)=> {
        app.use("/api/v1/", route.default);
    }).catch((error)=>{
        console.log("Error importing route", error);
    });
});

//setup the server
const server = async() => {
    try{
        //conenction to database
        await connect();
        app.listen(process.env.PORT,() => {
            console.log(`Server is listning to ${process.env.PORT}`)
        });
    }catch(error) {
       console.log("Server error" , error.message);
       //The process.exit(1); command in Node.js
       //is used to immediately terminate the running process with an exit code.
       process.exit(1);
    };
};

server();