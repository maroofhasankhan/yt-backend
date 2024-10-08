// require('dotenv').config({path:'./env'})
import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path: './env'
})

connectDB();























// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on('error',()=>{
//             console.error('Error connecting')
//             throw error;
//         });
//         app.listen(process.env.PORT,()=>{console.log(`listening on port ${process.env.PORT}`)});
                
//     }
//     catch(err){
//         console.error(err);
//         throw err;
//     }
// })()