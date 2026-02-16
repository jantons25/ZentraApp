import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Lee la URI desde las variables de entorno
    // Si no existe, usa la conexión local como fallback
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost/merndb";
    
    await mongoose.connect(mongoURI);
    
    console.log(">>> Database connected");
    console.log(`>>> Environment: ${process.env.NODE_ENV || "development"}`);
  } catch (error) {
    console.log("Error connecting to database:", error);
    // Detener el servidor si falla la conexión en producción
    process.exit(1);
  }
};