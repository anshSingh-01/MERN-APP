import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs' // file system
// import {multer} from 'multer'
// import { resourceLimits } from 'worker_threads';

// file is always unlink not delete

 cloudinary.config({ 
        cloud_name: 'dgxyfueos', 
        api_key: '192662395158235', 
        api_secret: '1_1hItna8-Wa6Jp9h2nxgBpzZmE' // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloud = async (localFilePath) => {
            try{
                    if(!localFilePath){
                        return null
                    }
                    // upload the file on cloudinary
              const result = await cloudinary.uploader.upload(localFilePath, {
                   resource_type: "auto",
                  });
                  return result;
            }
            catch(error) {
                console.log(error.message)
                    fs.unlinkSync(localFilePath) // remove the locally saved temp file
                    return null
            }
    }

export {uploadOnCloud}