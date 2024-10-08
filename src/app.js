import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

const corsOptions = {
  origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

import adminRouter from "./routes/admin.routes.js";
import publicRouter from "./routes/public.routes.js";

app.use("/api/admin", adminRouter);
app.use("/api/public", adminRouter);

export default app;