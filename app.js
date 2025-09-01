import dotenv from "dotenv";
import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser";
import "./database/db.js";
import userRoutes from './Routes/UserRoute.js'
import taskRoutes from './Routes/TaskRoute.js'

dotenv.config();
const app = express();
app.use(cors(
    {
        origin : process.env.FRONTEND_URL,
        credentials : true  
    }
))
app.use(express.json());
app.use(cookieParser()); 
console.log(process.env.FRONTEND_URL)

app.use("/user",userRoutes);
app.use("/task", taskRoutes);


app.listen(3000,()=>{
    console.log("App is running on port "+3000);
})