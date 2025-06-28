import { AsyncHandler } from "../utils/asyncHandler.js";

export const registerUser = AsyncHandler(async (req , res) => {

    return res.status(200).json({
        message : "ok",
        status : true ,
        user : {
            name : "ansh",
            email :"ansh@gmail.com",
            
        }
    })

})


