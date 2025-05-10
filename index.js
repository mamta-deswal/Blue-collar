require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./app/routes/auth");
const laborRoutes = require("./app/routes/Laborer")
const notificationRoutes = require('./app/routes/Notification'); 

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/labor", laborRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/', (req, res) => {
  res.send('✅ API is running successfully on App Engine!');
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

