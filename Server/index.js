import mongoose from "mongoose";
import {app} from "./app.js";

const connectDB = async() => {
 
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}\Hospital`)
          console.log((`\n MongoDB connected !! DB Host : ${connectioninstance.connection.host}`));
          
    } catch (error) {
        console.log("MONGODB connection Failed",error);
        process.exit(1)
        
    }
}

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("MONGO db connection failed !!! ", err);
})