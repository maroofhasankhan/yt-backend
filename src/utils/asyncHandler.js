// const asyncHandler=(fn)=>async(req, res, next)=>{
//     try{
//         await fn(req, res, next);
//     }catch(error){
//         console.error(error.stack);
//         res.status(err.code || 500).json({
//             success: false,
//             message:error.message
//         });
//     }
// }




// export const asyncHandler =(requestHandler)=>{
//     return (req, res, next)=>{
//         Promise.resolve()
//         .catch((err)=>next(err))
//     }
// }

// Higher order function that wraps async request handlers to handle errors
export const asyncHandler = (requestHandler) => {
    // Returns middleware function that processes the request
    return (req, res, next) => {
        // Wraps handler in Promise.resolve() to ensure Promise chain
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err)); // Catches any errors and passes them to Express error handler
    };
};

// module.exports={
//     asyncHandler
// }
