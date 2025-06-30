import { AsyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const generateAccessAndRefreshTokens = async (userId) =>{
      try{
               const user = await User.findById(userId)

               const accessToken = user.generateAccessTokem()
               const refreshToken = user.generateRefreshTokem()

               user.refreshToken = refreshToken
              await user.save({validateBeforeSave: false}) // to stop check password

              return {accessToken , refreshToken}
      }
      catch(err){
            throw new ApiError(500 ,err.message)
      }
}

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
              password : await bcrypt.hash(password ,10)

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

export const loginUser = AsyncHandler(async (req , res) => {

      // req body take data
      const {email ,username  ,password} = req.body
      // email is correct and exist 

      if(!username  && !email){
            return res.status(400).json({
               success: false,
               message : "Enter all fields"
            })
      }

      const existedUser = await User.findOne( {$or : [{username} , {email}]})

      if(!existedUser){
         return res.status(404).json( {
            success : false ,
            message : "User not Found"
         })
      }
      // password check 
      // console.log(existedUser.password)
      // const isValidPassword = await existedUser.isPasswordCorrect(password)
      const isValidPassword = existedUser.password == password
      if(!isValidPassword){
         // console.log("*")
            return res.status(401).json({
               success :false,
               message : "Invalid User Credential"
            })
      }
      // generate Access and Refresh token

      const {accessToken , refreshToken} =await generateAccessAndRefreshTokens(existedUser._id)

      // send cookie
     const loggedInUser =  await User.findById(existedUser._id).select("-password -refreshToken");
      const options = {
            httpOnly : true,// modified by server only
            secure : true
      }
      return res.status(200).cookie("accessToken" , accessToken ,options).cookie("refreshToken" , refreshToken , options).json(new ApiResponse(200,{user : loggedInUser ,accessToken,refreshToken}, "User Logged in Successfully"));
})


export const logoutUser = AsyncHandler(async (req ,res) => {
      const _id = req.user._id
     await User.findByIdAndUpdate(_id , {
               $set : {
                  refreshToken : undefined
               }
             },
             {
                  new : true
            }
          )
      const options = {
            httpOnly : true,
            secure : true
      }

      return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200 ,"User LoggedOut"))
})

export const  refreshAccessToken =  AsyncHandler(async (req , res) => {

   try{  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
      if(!incomingRefreshToken){
            throw new ApiError(401 ,"Unauthorized request")
      }

      const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)

      const user = await User.findById(decodedToken._id)
      if(!user) throw new ApiError(401 , "Invalid Refresh Token")
      
      if( incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is Expired or used")
      }

      const options = {
            httpOnly : true ,
            secure : true
      }
     const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

      return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200 ,{accessToken , refreshToken , options}, "Access Token Refreshed"))}
      catch(err){
         throw new ApiError(401 , "Invalid Refresh Token")
      }
})
