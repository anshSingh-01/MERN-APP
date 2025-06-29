import { AsyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";



export const registerUser = AsyncHandler(async (req , res) => {

    // destructuring Object (getting suer details from frontend)
    const {username , email ,fullname,  password } = req.body
    // validation
   
    if(!username || !email || !fullname || !password){
            return res.status(400).json({
                success : false ,
                message : "Enter All Fields"
            })
    }

    // check if this email is already exist or not
    const user = await User.findOne({$or : [{ username } ,{ email }]})
    if(user){
         throw new ApiError(409 , "User Already Exist")
    }
   
    // check for images , check for avatar
    
   const avatarLocalPath = req.files?.avatar?.[0]?.path;
    
       
   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  
   
   // ***********************************
   // let coverImageLocalPath; // to resolve scope error
   //    if( req.files && Array.isArray(req.files.coverImage)  && req.files.coverImage,length >0 ){
   //          coverImageLocalPath = req.files.coverImage[0].path
   //    }
    // ***********************************


       if(avatarLocalPath === undefined){
       return  new ApiError(400, "avatar file is req");
       }
       
    // upload them to cloudinary , avater
      const avatar = await uploadOnCloud(avatarLocalPath)
      const coverImage = await uploadOnCloud(coverImageLocalPath)
 
       
      if(!avatar){
            throw new ApiError(400, "avatar file is req");
      }
    // create user object - create entry in db
    
    const newUser = await User.create({
            username,
             fullname ,
              avatar : avatar.url ,
              coverImage : coverImage?.url || "",
              email , 
              password

    })
    // remove password and refresh token field from response

     const createdUser = await User.findById(newUser._id).select("-password -refreshToken")

     // check for user creation 
     if(!createdUser){
        throw new ApiError(500 , "Internal Server Error")
     }

    console.log(createdUser)

    // return res
     return res.status(201).json(
            new ApiResponse(200 , createdUser , "User Created successfully" )
     )

})


