require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeRegisterRoute = require("./Routes/EmployeeRegisterRoute");
const AuthRoute = require("./Routes/AuthRoute.js");
const breakRoutes = require("./Routes/BreakRoute.js");
const app = express();
app.use(cors({
  url: 'http://localhost:3000'
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

app.use(EmployeeRegisterRoute);
app.use(AuthRoute);

app.use(breakRoutes);
app.get("/", async (req, res) => {
  res.status(200).json({ message: "This is a backend data.!" });
});

app.listen(5000, () => {
  console.log("Backend server running on http://localhost:5000");
});
 