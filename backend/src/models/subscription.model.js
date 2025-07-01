import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema({
        subsriber : {
                type : Schema.types.ObjectId, // one who is Subscribing 
                ref : "User"
        },
        channel :{
            type : Schema.types.ObjectId,
            ref : "User"
        }
},
{
    timestamps : true
}
)

export const Subscription = mongoose.model('Subcription' , SubscriptionSchema)