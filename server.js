const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes=require('./routes/authRoutes')
const inventoryRoutes=require('./routes/inventoryRoutes')
const analyticsRoutes=require('./routes/analyticsRoutes')
const adminRoutes =require('./routes/adminRoutes')
const path =require("path")
//dotenv conig
dotenv.config();


//mongodb connection
connectDB();

//rest obejct
const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());







// routes  
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/admin", adminRoutes);




// my static folder
app.use(express.static(path.join(__dirname,'./client/build')))
// static Routes
app.get('*',function (req, res) {
  res.sendFile(path.join(__dirname,'./client/build/index.html'))
})
app.use(express.static(path.join(__dirname, './client/build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

//port
const port = process.env.PORT || 8080;
//listen port
app.listen(port, () => {
  console.log(
    `Server Running in  Mode on port ${process.env.PORT}`
      .bgCyan.white
  );
});
