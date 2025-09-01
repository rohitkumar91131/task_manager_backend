import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config();

const verifyToken = (req , res , next) =>{
    const token = req.cookies.jwt_token;
    if(!token){
        return res.json({
            success : false,
            msg : "No cookies found"
        })
    }
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        req.user = decoded;
        next();
    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
}

export default verifyToken