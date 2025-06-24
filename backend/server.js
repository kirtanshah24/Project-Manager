import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";



// app config 
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

// middleware
app.use(express.json());
app.use(cors());

// api routes

app.get("/", (req, res) => {
    res.send('API is running');
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));