import dotenv from 'dotenv';
import  mongoose from "mongoose";

dotenv.config();
connectToDatabase()
.then(()=>{
    console.log("Connected to db ")
})
.catch((err)=>{
    console.log(err.message)
})

async function connectToDatabase(){
    await mongoose.connect(process.env.MONGO_URL)
}



