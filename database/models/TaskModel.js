import mongoose, { Schema, model } from "mongoose";

const taskSchema = new Schema({
    content: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    completed : {
      type : Boolean,
      default : false
    },
    user_id : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User",
      required : true
    }
  });
  
const Task = model("Task", taskSchema);
export default Task
  