import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./db.js";

const PORT = process.env.PORT || 4000;

connectDB();
app.listen(PORT, () => {
  console.log(`>>> Server running on port ${PORT}`);
  console.log(`>>> Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `>>> CORS origin: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});
