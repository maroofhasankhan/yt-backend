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

export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err)); // Catch any errors and pass them to next()
    };
};

// module.exports={
//     asyncHandler
// }
