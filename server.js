import express from "express";
import colors from "colors";
import cors from "cors";
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDb from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import CategoryRoutes from "./routes/CategoryRoutes.js";
import ProductRoutes from "./routes/ProductRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config();

// Database connection
connectDb();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Get the directory name of the current module (in ES module scope)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app (build folder)
app.use(express.static(path.join(__dirname, './client/build')));

// API routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/category', CategoryRoutes);
app.use('/api/v1/product', ProductRoutes);

// Catch-all route to serve React app
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`.bgGreen);
});
