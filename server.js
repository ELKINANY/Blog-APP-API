require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 7000;
const errorMiddleware = require("./middlewares/error.middleware");
const cors = require("cors");
const apiError = require("./utils/apiError");

app.use(cors());

app.use(express.json());

app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/categories", require("./routes/category.route"));
app.use("/api/posts", require("./routes/posts.route"));
app.use("/api/comments", require("./routes/comments.route"));
app.use("/api/users", require("./routes/user.route"));

app.use((req, res, next) => {
  next(new apiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
