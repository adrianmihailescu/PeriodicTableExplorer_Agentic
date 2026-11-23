import cors from "cors";
import express from "express";
import elementsRouter from "./routes/elementsRoutes.js";
import { getElementCount } from "./services/elementService.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", elementCount: getElementCount() });
});
app.use("/api/elements", elementsRouter);
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(port, () => {
  console.log(`Periodic Table API listening on http://localhost:${port}`);
});
