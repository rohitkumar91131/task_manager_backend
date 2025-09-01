import express from "express";
import User from "../database/models/UserModel.js"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from '../middlewares/VerifyJwt.js'
import {nanoid} from 'nanoid';
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, name, password } = req.body;

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
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        msg: "Name required" 
    });
    }

    const isUserExists = await User.findOne({ username });
    if (isUserExists) {
      return res.status(409).json({ 
        success: false, 
        msg: "User already exists" 
    });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const refresh_token = nanoid();
    if(!refresh_token){
      return res.json({
        success : false,
        msg : "Error in providing refresh_token"
      })
    }

    await User.create({ 
      username, 
      name, 
      refresh_token ,
      password: hashedPassword 
    });

    return res.status(201).json({ 
      success: true, 
      msg: "Signup successful" 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      msg: err.message 
    });
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

    const access_token = jwt.sign(
      { user_id: isUserExists._id },
      process.env.JWT_SECRET,  
      { expiresIn: "1h" }
    );

    const refresh_token = jwt.sign(
      {
        refresh_token : isUserExists.refresh_token
      },
      process.env.JWT_SECRET,
      {
        expiresIn : "7d"
      }
    )
    res.cookie("access_token", access_token, { 
        httpOnly: true,
        secure : true,
        maxAge : 1000*60*60*24*7,
        sameSite : "None"
    });

    res.cookie("refresh_token",refresh_token,{
      httpOnly : true,
      secure : true,
      maxAge : 1000*60*60*24*7,
      sameSite : "None"
    })

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
    const user = await User.findById(req.user.user_id);
    console.log(user)
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
  res.clearCookie("access_token",{ 
    httpOnly: true,
    secure : true,
    maxAge : 1000*60*60*24*7 ,
    sameSite : "None"
  })
  res.clearCookie("refresh_token",{ 
    httpOnly: true,
    secure : true,
    maxAge : 1000*60*60*24*7 ,
    sameSite : "None"
  })
  res.json({
    success : true,
    msg :"Logout successful"
  })
})

router.post("/grant_new_access_token",verifyToken ,async(req,res)=>{
  try{
    const user = await User.findOne({refresh_token : req.user_refresh_token.refresh_token});
    const new_access_tokens = jwt.sign(
       {
        user_id : user._id
       }
       ,
       process.env.JWT_SECRET,
       {
        expiresIn : "1h"
       }
    );
    const new_refresh_tokens = nanoid();
    if(!new_refresh_tokens){
      return res.json({
        success : false,
        msg : "Error in providing new refresh tokens"
      })
    }
    user.refresh_token = new_refresh_tokens;
    await user.save();
    res.cookie("access_token",new_access_tokens,{
      httpOnly : true,
      secure : true,
      sameSite : "None",
      maxAge : 1000*60*60*24*7
    })   
    res.cookie("refresh_token",new_refresh_tokens,{
      httpOnly : true,
      secure : true,
      sameSite : "None",
      maxAge : 1000*60*60*24*7
    })
    res.json({
      success : true,
      msg : "New access tokens sent"
    })
  }
  catch(err){
    res.json({
      success : false,
      msg : err.message
    })
  }
})


export default router;
