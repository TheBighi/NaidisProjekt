const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const energyreadingRouter = require("./routes/energyreading");
const { notFoundHandler, errorHandler } = require("./middleware/globalErrorHandler");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "ok",
      db: "ok"
    });
  } catch (err) {
    res.json({
      status: "ok",
      db: "fail"
    });
  }
});

app.use("/", energyreadingRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
