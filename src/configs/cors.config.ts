import { CorsOptions } from "cors";
import "dotenv/config";

export const corsConfigs: CorsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000' || 'http://172.21.80.1:3000',
    methods: ["GET", "POST", "PUT","DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};