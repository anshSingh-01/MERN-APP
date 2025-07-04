import {Router} from "express"
import { changeCurrentPassword, getUserChannelProfile, getwatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetail, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js"
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/auth.middleware.js"
const router = Router()

router.route('/register').post(
   upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
                name : "coverImage",
                maxCount : 1 
        }
   ]) ,
    registerUser

)

router.route('/login').post( loginUser)

// secured Routes

router.route('/logout').post(verifyJwt , logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password',).post(verifyJwt , changeCurrentPassword)
router.route('/get-user' ).get(verifyJwt , getUserChannelProfile)
router.route('/update').patch(verifyJwt ,updateAccountDetail ) // patch is usefull

// verify  + mullter + controller
router.route('/avatar').patch(verifyJwt , upload.single('avatar') ,updateUserAvatar)

router.route('/cover-image').patch(verifyJwt , upload.single('coverImage'),updateUserCoverImage)

router.route('/channel/:username').get(verifyJwt ,getUserChannelProfile)
router.route('/history').get(verifyJwt ,getwatchHistory)


export default router