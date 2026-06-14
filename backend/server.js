import cors from "cors";
import { config } from "dotenv";
import exp from "express";
import { connect, connection } from "mongoose";
import morgan from "morgan";
import { authRouter } from "./APIs/AuthAPI.js";
import { materialRouter } from "./APIs/MaterialAPI.js";
import { pickupRouter } from "./APIs/PickupAPI.js";
import { userRouter } from "./APIs/UserAPI.js";

config();

//create express application
const app = exp();

const defaultClientUrls = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://waste-to-wealth-app.vercel.app",
  "https://waste-to-wealth-app-scrap-pickup.vercel.app",
];

const configuredClientUrls = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URLS,
]
  .filter(Boolean)
  .flatMap((urls) => urls.split(","))
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultClientUrls, ...configuredClientUrls])];
const allowedVercelPreviewPattern = /^https:\/\/waste-to-wealth-app.*\.vercel\.app$/;

//use middlewares
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/$/, "");

      if (
        !normalizedOrigin ||
        allowedOrigins.includes(normalizedOrigin) ||
        allowedVercelPreviewPattern.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(exp.json());
app.use(morgan("dev"));

//connect APIs
app.use("/auth-api", authRouter);
app.use("/user-api", userRouter);
app.use("/material-api", materialRouter);
app.use("/pickup-api", pickupRouter);

app.get("/", (req, res) => {
  res.json({ message: "Waste to Wealth API is running" });
});

app.get("/health", (req, res) => {
  const isDbConnected = connection.readyState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    message: "Waste to Wealth API health",
    api: "ok",
    database: isDbConnected ? "connected" : "disconnected",
  });
});

//connect to db and start server
const port = process.env.PORT || 5000;
const dbUrl = process.env.MONGODB_URI;

app.listen(port, () => console.log(`Server started on port ${port}`));

if (!dbUrl) {
  console.log("MONGODB_URI is missing. Add it in backend/.env");
} else {
  connect(dbUrl)
    .then(() => console.log("DB connection success"))
    .catch((err) => {
      console.log("Error in DB connection:", err.message);
    });
}

//dealing with invalid path
app.use((req, res) => {
  res.status(404).json({ message: `${req.url} is invalid path` });
});

//error handling middleware
app.use((err, req, res, next) => {
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "An account with this email already exists. Please login instead.",
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong. Please try again.",
  });
});
