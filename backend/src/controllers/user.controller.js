import { AsyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mongoose from "mongoose";

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

export const changeCurrentPassword = AsyncHandler(async (req , res) => {
            const  {oldpassword, newpassword} = req.body

            const {_id} = req.user

            const user =await User.findById(_id)

            const correctPassword  = user.password

            if(correctPassword != oldpassword){
                  throw new ApiError(400,"InValid Password")
            }

            user.password = newpassword

            await user.save({validateBeforeSave : false})

            return res.status(200).json(new ApiResponse(200 , {} , "Password Changed Successfully"))

})

export const  getCurrentUser = AsyncHandler( async (req , res) => {

      return res.status(200).json(new ApiResponse(200 , req.user ,"Current User Fetched successfully"))
})

export const updateAccountDetail  = AsyncHandler( async (req , res) => {
            const {fullname , email } = req.body

            if(!fullname && !email){
                  throw new ApiError(400 , "All Fields req")
            }

            const _id = req?.user._id
           const user = await User.findByIdAndUpdate(_id, 
           {
                  $set : {
                              fullname : fullname,
                              email : email
                  }
           }, {new : true}
      ).select("-password")

      return res.status(200).json(new ApiResponse(200 , user, "Account Details Updated Successfully"))

})


export const updateUserAvatar = AsyncHandler(async (req , res) => {

     const avatarLocalPath = req.file?.path     
      if(!avatarLocalPath){
            throw new ApiError(400 , "Avatar file is Missing ")
      }

      const avatar = await uploadOnCloud(avatarLocalPath)

      if(!avatar.url){
            throw new ApiError(400 , "Error while Uploading on avatar")
      }
      const user = await User.findByIdAndUpdate(req.user?._id , {
            $set : {
                  avatar : avatar.url
            }
      },{new :true}).select('-password')
      await user.save({validateBeforeSave :false})
      return res.status(200).json(new ApiResponse(200 , user, "Avatar is Updated"))
})

export const updateUserCoverImage = AsyncHandler(async (req , res) => {

     const coverImageLocalPath = req.file?.path     
      if(!coverImageLocalPath){
            throw new ApiError(400 , "CoverImage file is Missing ")
      }

      const coverImage = await uploadOnCloud(coverImageLocalPath)

      if(!coverImage.url){
            throw new ApiError(400 , "Error while Uploading on CoverImage")
      }
      const user = await User.findByIdAndUpdate(req.user?._id , {
            $set : {
                  coverImage : coverImage.url
            }
      },{new :true}).select('-password')
      await user.save({validateBeforeSave :false})
      return res.status(200).json(new ApiResponse(200 , user, "CoverImage is Updated"))
})


export const getUserChannelProfile = AsyncHandler(async (req, res) => {

       // taking data from params
       const {username} = req.params
       
       if(!username?.trim()){
            throw new ApiError(400 , "username is missing")
       }

       const channel =await User.aggregate([ 
            // pipeline 1
                  {
                        $match :{
                              username : username?.toLowerCase()
                        }
                  },
                  // finding subscribers
                   // pipeline 2
                  {
                        $lookup :{
                              from : "subscriptions",
                              localField : "_id",
                              foreignField : "channel",
                              as : "subscribers"
                        }
                  },
                  // subsribed to
                   // pipeline 3
                  {
                        $lookup :{
                              from : "subscriptions",
                              localField : "_id",
                              foreignField : "subscriber",
                              as : "subscribedTo"
                        }
                  },
                  //add this all to one ds
                   // pipeline 4
                  {
                        $addFields : {
                              subscribersCount : {
                                    $size: "subscribers"
                              },
                              subscribedTo : {
                                    $size : "subscribedTo"
                              },
                              isSubscribed :{
                                    $cond : {
                                          if :{$in: [req.user?._id , "$subscribers.subscriber"]},
                                          then :true,
                                          else:false
                                    }
                              }
                        },
                       
                  },
                   // pipeline 5
                   {
                              $project : {
                                    fullname :1,
                                    username :1,
                                    subscribersCount :1,
                                    subscribedToCount :1,
                                    isSubscribed :1,
                                    avatar:1,
                                    coverImage :1,
                                    email :1,
                              }
                  }

       ])

       if(!channel?.length){
            throw new ApiError(404 ,"Channel does not exist")
       }

       return res.status(200).json(
            new ApiResponse(200 , channel[0],"User Channel fetched successfuuly")
       )

})

export const getwatchHistory = AsyncHandler(async (req , res) => {
            const user = await User.aggregate([
                  {
                        $match : {
                              _id : new mongoose.Types.ObjectId(req.user._id)
                        }
                  },
                  {
                        $lookup : {
                              from :"videos",
                              localField :"watchHistory",
                              foreignField : "_id",
                              as: "watchHistory",
                              pipeline : [
                                    {
                                          $lookup : {
                                                from : "user",
                                                localField : "owner",
                                                foreignField : "_id",
                                                as: "owner",
                                                pipeline :[
                                                      {
                                                            $project :{
                                                                  fullname :1,
                                                                  username : 1,
                                                                  avatar :1,
                                                            }                                             
                                                      }
                                                ]
                                          }
                                    },
                                    // resolving the DS
                                    // easy for frontend
                                    {
                                          $addFields : {
                                                owner :{
                                                      $first : "$owner"
                                                }
                                          }
                                    }
                              ]
                        }
                  }
            ])

            return res.status(200).json(
                  new ApiResponse(200 , user[0].watchHisory , "Watch History Fetched Successfully")
            )
})