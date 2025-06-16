import mongoose from 'mongoose'
import {MONGODB_URI} from '../constants.js'



export const connectDb = async ()=> {
        try{
            await mongoose.connect(MONGODB_URI).then(
               () => {
                    console.log("Connected to DATABASE!!!");
                }
            );
        }
        catch(err){
            console.log("Error Connected to  MONGODB")
        }
}









