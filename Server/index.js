import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); // ✅ explicitly load .env from root

const connectDB = async() => {
 
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}\Hospital`)
          console.log((`\n MongoDB connected !! DB Host : ${connectioninstance.connection.host}`));
          
    } catch (error) {
        console.log("MONGODB connection Failed",error);
        process.exit(1)
        
    }
}
console.log("Cloudinary api Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("MongoDB api URI:", process.env.MONGODB_URI);


connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("MONGO db connection failed !!! ", err);
})