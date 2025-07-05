import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// app config 
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

// middleware
app.use(express.json());
app.use(cors());

// api routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
    res.send('API is running');
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));