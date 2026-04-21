const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, "Route not found", "NOT_FOUND"));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = statusCode >= 500 ? "Something went wrong." : err.message;

  if (statusCode >= 500) {
    console.error("Unhandled error:", err.message);
  }

  res.status(statusCode).json({
    error: code,
    message
  });
};

module.exports = { notFoundHandler, errorHandler };
