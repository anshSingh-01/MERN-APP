import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const VideoSchema = new Schema(
    {
            videoFile : {
                    type :String , // claudmary url
                    required : true,
            },
            thumbnail : {
                    type :String , // claudmary url
                    required : true,
            },
            title : {
                    type :String , 
                    required : true,
            },
            description : {
                    type :String , 
                    required : true,
            },
            duration : {
                    type :Number , // claudmary url
                    required : true,
            },
            views : {
                    type :Number , // claudmary url
                    required : true,
            },
            isPublished : {
                    type : true
            },
            owner :  {
                type : Schema.Types.ObjectId,
                ref : 'User',
            }
    },
    {
        timestamps:true
    }
)

VideoSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model('Video',VideoSchema)