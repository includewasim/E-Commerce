import mongoose from 'mongoose'
import colors from 'colors'

const connectDb=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URL)
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgBlue)
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white)
    }
}
export default connectDb;