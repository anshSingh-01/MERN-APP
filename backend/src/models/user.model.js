import mongoose ,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken' // it is a bearer token
import bcrypt from 'bcrypt'



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
            ref : "Video",

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
// middle ware for encryption of password
userSchema.pre("save" ,async function (next) {
    if(!this.isModified("password")){
        return next()
    }
        this.password = await  bcrypt.hash(this.password ,10)
        next()
})


// custom method

userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password , this.password)
}


// methods for generating access token
userSchema.methods.generateAccessTokem = function () {
       return jwt.sign({
                _id : this._id,
                email:this.email ,
                username : this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    
    )
}
userSchema.methods.generateRefreshTokem = function () {

           return jwt.sign({
                _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    
    )

}

export default  mongoose.model('User' , userSchema)