import mongoose ,{Schema} from 'mongoose'

const userSchema = new Schema({
    username : {
            type : String , 
            required : true,
            unique : true,
            lowercase : true ,
            trim : true,
            // used for database to easy the search of user name
            index  : true,
    },
    email : {
        type : String , 
        required : true,
        unique : true,
        lowercase : true ,
        trim : true,
    },
    fullname : {
            type : String , 
            required : true,
            lowercase : true ,
            trim : true,
           
    },
    avatar : {
            type : String ,// cloudinary url
            required : true,
    },
    coverImage : {
            type :String, 
    },
    watchHistory :[
        {
            type : Schema.Types.ObjectId,
            ref : "video",

        }
    ],
    password : {
        type : String,
        required : [true , 'Password is Required']
    },
    refreshToken : {
        type : String
    },
   },
    {
        timestamps : true
    }
)


export default  mongoose.model('User' , userSchema)