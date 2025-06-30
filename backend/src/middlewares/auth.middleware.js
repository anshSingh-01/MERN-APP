import { ApiError } from "../utils/apiError.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'

export const verifyJwt = AsyncHandler(async (req , _ , next)=> {

  try{  const token =req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401 ,"Unauthorized Request")
    }
   const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

   const user = await User.findById(decodedToken?._id).select("-password -refreshToken") // getting user
    if(!user){
        
            throw new ApiError(401 , "Invalid Access Token")
    }

    req.user = user
    next()}
    catch(err){
            throw new ApiError(401 , err?.message || "Invalid Access Token")
    }
})