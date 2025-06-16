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

try {
    app.on("error" , (error) => {
            throw error
    })
}
catch(err){
        console.error(err.message);
}

export {app}
