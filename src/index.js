// require('dotenv').config({path:'./env'})
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from "./app.js"

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    app.on('error',(error)=>{
        console.error('Server Error', error.message);
        process.exit(1);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server running on port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.error('Failed to connect to MongoDB',error.message);
})























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