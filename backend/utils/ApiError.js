class ApiError extends Error {
  constructor(statusCode, message, code = "BAD_REQUEST") {
    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = ApiError;
