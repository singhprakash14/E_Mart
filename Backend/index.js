const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");
const router = require("./routes/route");

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);

const PORT = process.env.PORT || 8080  ;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Connected to Database` );
    console.log(`Server is running ${PORT}`);
  });
});
