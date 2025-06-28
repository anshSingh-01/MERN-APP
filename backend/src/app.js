import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser'
const app = express();

// ***setting Configuaration of express server***
// catching error from app
app.use(cors({
        origin : '*',
        credentials:true        
})); // cross-origin resource sharing 

//initializing app in a more safe way
app.use(express.json({limit:'10kb'}))

// url parsing 
app.use(express.urlencoded({extended:true , limit:"10kb"}))

// public asests (to store something like image pdf)
app.use(express.static("public"));
app.use(cookieParser());

// routes

import userRouter from "./routes/user.routes.js"

// routes declaration
app.use('/api/v1/auth' ,userRouter)

// http://localhost:5000/api/v1/auth/register
try {
    app.on("error" , (error) => {
            throw error
    })
}
catch(err){
        console.error(err.message);
}

export {app}
