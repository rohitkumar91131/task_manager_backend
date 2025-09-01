import express from 'express';
import Task from '../database/models/TaskModel.js'
import verifyToken from '../middlewares/VerifyJwt.js'

const router = express.Router();
 

router.get("/get_alltasks",verifyToken , async(req,res)=>{
    try{
        const user_id = req.user.user_id;
        const allTasks = await Task.find({user_id}).sort({createdAt : -1});
        res.json({
            success : true,
            msg : "All tasks retrieved",
            allTasks
        })
    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
})
router.post("/new_task",verifyToken,async(req, res)=>{
    const {content } = req.body;
    if(!content){
        return res.json({
            success : false,
            msg :"Task is empty"
        })
    }
    console.log(req.user.user_id)
    try{
        const newTask = await Task.create({
            content,
            user_id : req.user.user_id,
            completed : false,
        })
        res.json({
            msg : "Task Added",
            success : true
        })
    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
})

router.patch("/edit_task", verifyToken, async (req, res) => {
    try {
      const { task_id, content } = req.body;
  
      if (!task_id || !content || !content.trim()) {
        return res.json({ 
            success: false, 
            msg: "Task ID and content are required" 
        });
      }
  
      const task = await Task.findOne({ 
        _id: task_id, 
        user_id: req.user.user_id
      });
      console.log(task)
      if (!task) {
        return res.json({ 
            success: false, 
            msg: "Task not found" 
        });
      }
  
      task.content = content.trim();
      await task.save();
  
      return res.json({ 
        success: true, 
        msg: "Task updated successfully", 
        updatedTask: task 
    });
    } catch (err) {
      console.error(err);
      return res.json({ 
        success: false, 
        msg: err.message 
    });
    }
  });

router.patch("/change_completion",verifyToken ,async(req,res)=>{
    try{
        const {task_id , completed } = req.body;
        const task = await Task.findById(task_id);
        task.completed = !task.completed;
        await task.save()
        res.json({
            success :true,
            msg : `Task status changed from ${completed}`
        })
    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
})

router.delete("/delete_task",async(req,res)=>{
    try{
        const {task_id} = req.body;
        await Task.findByIdAndDelete(task_id);
        res.json({
            success : true,
            msg : "Deleted Successfully"
        })
    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
})
export default router