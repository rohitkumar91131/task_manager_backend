import express from "express";
import User from "../database/models/UserModel.js"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from '../middlewares/VerifyJwt.js'
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, name, password } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, msg: "Username required" });
    }
    if (!password) {
      return res.status(400).json({ success: false, msg: "Password required" });
    }
    if (!name) {
      return res.status(400).json({ success: false, msg: "Name required" });
    }

    const isUserExists = await User.findOne({ username });
    if (isUserExists) {
      return res.status(409).json({ success: false, msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ username, name, password: hashedPassword });

    return res.status(201).json({ success: true, msg: "Signup successful" });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        msg: "Username required" 
    });
    }
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        msg: "Password required" 
    });
    }

    const isUserExists = await User.findOne({ username });
    if (!isUserExists) {
      return res.status(404).json({ 
        success: false, 
        msg: "No such user found" 
    });
    }

    const comparePassword = await bcrypt.compare(password, isUserExists.password);
    if (!comparePassword) {
      return res.status(401).json({ 
        success: false, 
        msg: "Invalid password" 
    });
    }

    const token = jwt.sign(
      { user_id: isUserExists._id },
      process.env.JWT_SECRET,  
      { expiresIn: "1h" }
    );

    res.cookie("jwt_token", token, { 
        httpOnly: true,
        secure : true,
        maxAge : 1000*60*60*24*7 ,
        sameSite : "strict"
    });

    return res.status(200).json({ 
        success: true, 
        msg: "User logged in successfully" 
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ 
        success: false, 
        msg: err.message 
    });
  }
});

router.get("/logged_in_status",verifyToken ,(req,res)=>{
  res.json({
    success : true,
    msg : "You are logged in"
  })
})

router.get("/get_Name",verifyToken,async(req,res)=>{
  try{
    const user = await User.findById(req.user.user_id).select("name");
    res.json({
      success : true,
      msg : "Name found",
      name : user.name
    })
  }
  catch(err){
    res.json({
      success : false,
      msg : err.message
    })
  }
})


router.post("/logout",verifyToken ,(req,res)=>{
  res.clearCookie("jwt_token",{ 
    httpOnly: true,
    secure : true,
    maxAge : 1000*60*60*24*7 ,
    sameSite : "strict"
  })
  res.json({
    success : true,
    msg :"Logout successful"
  })
})
export default router;
