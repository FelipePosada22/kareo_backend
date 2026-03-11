import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

console.log(process.env.DATABASE_URL);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Medora API running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});