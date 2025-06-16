
// this is a Higher order function which take function as argument
// use to reduce crash of Db due to high calls

// const AsyncHandler = (fn) => async (req , res , next) => {}

// export const AsyncHandler = (fn) => async (req , res , next) => {

//         try{
//               await  fn(req , res, next);
//         }
//         catch(err){
//                 res.status(err.code || 500).json({
//                         success : false,
//                         message : err.message
//                 })
//         }

// }

// another way of coding this

const AsyncHandler = (RequestHandler) => {

        (req , res , next) => {

                Promise.resolve(
                    RequestHandler(req , res , next)
                ).catch(
                    (err) => next(err)
                )

        }

}

export {AsyncHandler}


