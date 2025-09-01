import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    joining_date: { 
        type: Date, 
        default: Date.now 
    },
    refresh_token : {
        type : String,
        
    }
});
  
const User = model("User", userSchema);
export default User