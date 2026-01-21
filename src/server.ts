import express from "express";
import cors from "cors";
import { corsConfigs } from "./configs/cors.config";
import apiRoutes from "./middlewares/api-routes";
import { config as envConfig } from "dotenv";

envConfig();
const app = express();

// CORS Middleware
app.use(cors(corsConfigs));

// JSON Middleware & Form Data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main Routes
app.use(apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at "http://localhost:${PORT}"...`);
});
