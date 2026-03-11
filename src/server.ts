import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import { authMiddleware } from "./shared/middleware/auth.middleware";
import patientRoutes from "./modules/patients/patient.routes";
import appointmentRoutes from "./modules/appointments/appointment.routes";
import professionalRoutes from "./modules/professionals/professional.routes";
import appointmentTypeRoutes from "./modules/appointment-types/appointmentType.routes";
import scheduleRoutes from "./modules/schedules/schedule.routes";
const app = express();

app.use(cors());
app.use(express.json());


app.use("/auth", authRoutes);
app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/professionals", professionalRoutes);
app.use("/appointment-types", appointmentTypeRoutes);
app.use("/schedules", scheduleRoutes);


app.get("/me", authMiddleware, (req: any, res) => {
  res.json(req.user);
});

app.get("/", (req, res) => {
  res.send("Medora API running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});