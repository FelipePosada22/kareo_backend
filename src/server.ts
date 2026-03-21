import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import reminderRoutes from "./modules/reminders/reminder.routes";
import { startReminderCron } from "./jobs/reminderCron";
import { authMiddleware } from "./shared/middleware/auth.middleware";
import patientRoutes from "./modules/patients/patient.routes";
import appointmentRoutes from "./modules/appointments/appointment.routes";
import professionalRoutes from "./modules/professionals/professional.routes";
import appointmentTypeRoutes from "./modules/appointment-types/appointmentType.routes";
import scheduleRoutes from "./modules/schedules/schedule.routes";
import invoiceRoutes from "./modules/billing/invoice.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import userRoutes from "./modules/users/user.routes";
import clinicRoutes from "./modules/clinic/clinic.routes";
import refundRoutes from "./modules/refunds/refund.routes";
import treatmentPlanRoutes from "./modules/treatment-plans/treatmentPlan.routes";
import prescriptionRoutes from "./modules/prescriptions/prescription.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
const app = express();

app.use(cors());
app.use(express.json());


app.use("/auth", authRoutes);
app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/professionals", professionalRoutes);
app.use("/appointment-types", appointmentTypeRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/users", userRoutes);
app.use("/clinic", clinicRoutes);
app.use("/refunds", refundRoutes);
app.use("/treatment-plans", treatmentPlanRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/reminders", reminderRoutes);
app.use("/notifications", notificationRoutes);

startReminderCron();


app.get("/me", authMiddleware, (req: any, res) => {
  res.json(req.user);
});

app.get("/", (req, res) => {
  res.send("Medora API running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});