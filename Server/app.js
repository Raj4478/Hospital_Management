import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({limit: "60kb"}))
app.use(express.urlencoded({extended: true, limit: "30kb"}))
app.use(cookieParser())
import userRouter from "./router/user.router.js"

app.get("/",(req,res)=>{
    res.json(process.env.PORT);
})


app.use("/api/v1/user",userRouter)

export {app}