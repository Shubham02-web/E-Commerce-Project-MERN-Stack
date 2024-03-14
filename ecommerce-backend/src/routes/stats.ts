import express from "express";
import { adminOnly } from "../middleware/auth.js";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/stats.js";

const app = express.Router();
// Route for stats =- /api/v1/dashboard/stats
app.get("/stats", adminOnly, getDashboardStats);
// Route for stats =- /api/v1/dashboard/pie
app.get("/pie", adminOnly, getPieCharts);
// Route for stats =- /api/v1/dashboard/bar
app.get("/bar", adminOnly, getBarCharts);
// Route for stats =- /api/v1/dashboard/line
app.get("/line", adminOnly, getLineCharts);
export default app;
