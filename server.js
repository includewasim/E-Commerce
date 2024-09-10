import express from "express"
import colors from "colors"
import cors from "cors"
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDb from "./config/db.js"
import authRoute from "./routes/authRoute.js"
import CategoryRoutes from "./routes/CategoryRoutes.js"
import ProductRoutes from "./routes/ProductRoutes.js"
import path from 'path'

dotenv.config()

connectDb()

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, './client/build')))


app.use('/api/v1/auth', authRoute)
app.use('/api/v1/category', CategoryRoutes)
app.use('/api/v1/product', ProductRoutes)


app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/index.html'))
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`.bgGreen)
})