import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs' // file system
import {multer} from 'multer'
import { resourceLimits } from 'worker_threads';

// file is always unlink not delete

 cloudinary.config({ 
        cloud_name: 'dgxyfueos', 
        api_key: '666221465518649', 
        api_secret: '<your_api_secret>' // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloud = async (localFilePath) => {
            try{
                    if(!localFilePath){
                        return null
                    }
                    // upload the file on cloudinary
                const response = await  cloudinary.v2.uploader.upload(localFilePath , {
                        resource_type : "auto"
                    })
                    //file uploaded 
                    console.log("file is uploaded on cloudinary", response.url)
                    return url
            }
            catch(error) {
                    fs.unlinkSync(localFilePath) // remove the locally saved temp file
                    return null
            }
    }

export {uploadOnCloud}