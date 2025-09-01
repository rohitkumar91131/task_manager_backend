import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config();

const verifyToken = (req , res , next) =>{
    const access_token = req.cookies.access_token;
    const refresh_token = req.cookies.refresh_token;

    if(!refresh_token || !access_token){
        return res.json({
            success : false,
            msg : "No cookies found"
        })
    }
    try{
        const refresh_token_decoded = jwt.verify(refresh_token , process.env.JWT_SECRET)
        if(!refresh_token_decoded){
            return res.json({
                success : false,
                msg : "no_refresh_token"
            })
        }
        const access_token_decoded = jwt.verify(access_token ,process.env.JWT_SECRET);
        if(!access_token_decoded){
            return res.json({
                success : false,
                msg : "no_access_token"
            })
        }
        req.user = access_token_decoded;
        req.user_refresh_token = refresh_token_decoded
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