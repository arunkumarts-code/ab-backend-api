import { CorsOptions } from "cors";
import "dotenv/config";

export const corsConfigs: CorsOptions = {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT","DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};