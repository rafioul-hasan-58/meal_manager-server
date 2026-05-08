import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import router from "./app/routes";
import GlobalErrorHandler from "./app/errors/globalErrorHandler";
import { PrismaClient } from "@prisma/client";
import path from "path";
import morgan from "morgan";

const app: Application = express();
const prisma = new PrismaClient();
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://meal.manager.sourob.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected successfully!");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
// log api
app.use(morgan("dev"));
// cors
app.use(cors(corsOptions));
// body parser
app.use(express.json({ limit: "3000mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "3000mb",
    parameterLimit: 100000,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));


// Route handler for root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "meal manager server is running!",
  });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/views"));

app.get("/payment", (req: Request, res: Response) => {
  res.render("stripe");
});

// Router setup
app.use("/api/v1", router);


// Global Error Handler
app.use(GlobalErrorHandler);

// API Not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
