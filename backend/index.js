const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

app.use(cors());
app.use(express.json());

const user = require("./Database/Users");
const auth = require("./Middleware/Auth")

const truck = require("./Database/Truck_registaion")

const connectDB = require("./config/db");
connectDB();

const amenityRoutes = require("./routes/amenityRoutes");
const documentRoutes = require("./routes/documentRoutes");
const truckRoutes = require("./routes/truckRoutes");
const tripRoutes = require("./routes/tripRoutes");


app.use("/amenityRoutes", amenityRoutes)
app.use("/documentRoutes", documentRoutes);
app.use("/truckRoutes", truckRoutes)
app.use("/tripRoutes", tripRoutes)


////////////////////////////////////////////

app.post("/signup", async (req, res) => {
  const { UserName, Email, Password } = req.body;
  const check_email = await user.findOne({ Email });

  if (check_email) {
    return res.status(409).json({
      message: "Email already registered"
    });

  }
  const password_crypt = await bcrypt.hash(String(Password), 10);
  const new_user = new user({
    UserName,
    Email,
    Password: password_crypt
  })
  await new_user.save();
  res.status(200).json({ "message": "Signup sucessfull" })
})

////////////////////////////////////////////

app.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  const check_email = await user.findOne({ Email });

  if (!check_email) {
    return res.status(404).json({
      message: "Email is not registered"
    });
  }

  const check_password = await bcrypt.compare(
    String(Password),
    check_email.Password
  );

  if (!check_password) {
    return res.status(401).json({
      message: "Password is incorrect"
    });
  }

  const token = jwt.sign(
    { userId: check_email.id },
    "Anuj"
  );

  return res.status(200).json({
    message: "Login successful",
    Token: token
  });
});
////////////////////////////////////////////

app.post("/registrations", auth, async (req, res) => {
  const { Truck_num, Truck_brand, Truck_model, Manufacturing_year, Owner_name, Milage } = req.body;
  const { Driver_name, DOB, License_num, License_expiry } = req.body;

  if (!Truck_num || !Truck_brand || !Truck_model || !Manufacturing_year || !Owner_name || !Milage || !Driver_name || !DOB || !License_num || !License_expiry) {
    return res.json({ "message": "Fill all details" })
  };
  if (parseInt(DOB) > 50 && parseInt(DOB) < 18) {
    return res.json({ "message": "Invalid driver details" })
  }
  const expiryDate = new Date(License_expiry);
  const today = new Date();

  if (isNaN(expiryDate.getTime())) {
    return res.status(400).json({
      message: "Invalid licence expiry date"
    });
  }

  if (expiryDate < today) {
    return res.status(400).json({
      message: "Licence has expired"
    });
  }

  const new_truck = new truck(
    Truck_num,
    Truck_brand,
    Truck_model,
    Manufacturing_year,
    Owner_name,
    Milage,
    Driver_name,
    DOB,
    License_num,
    License_expiry
  )
  await new_truck.save();
  return res.json({ "message": "Registration successful" });
}
)

////////////////////////////////////////////

app.post("/dashboard", auth, async (req, res) => {

})

app.listen(3000, () => {
  console.log("server is running");

})