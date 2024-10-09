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

export {asyncHandler};


const asyncHandler =(requestHandler)=>{
    (req, res, next)=>{
        Promise.resolve()
        .catch((err)=>next(err))
    }
}