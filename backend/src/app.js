import express from 'express'
import cors from 'cors';
const app = express();

// catching error from app
app.use(cors()); // cross-origin resource sharing 
app.use(express.json())
try {
    app.on("error" , (error) => {
            throw error
    })
}
catch(err){
        console.error(err.message);
}

export {app}
