import JWT from 'jsonwebtoken'
import userModels from '../models/userModels.js'

export const requireSignin = async(req,res,next)=>{
try {
    const decode=JWT.verify(req.headers.authorization,process.env.JWT_SECRET)
    req.user=decode;
    next()
} catch (error) {
    console.log(error)
}    
}

export const isAdmin = async(req,res,next)=>{
    try {
        const user=await userModels.findById(req.user._id)
        if(user.role!=1){
            return res.status(400).send({
                success:false,
                message:"Unauthorized Access"
            })
        }else {
            next()
        }
    } catch (error) {
        console.log(error)
    }
}