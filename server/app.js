import express from "express";
import cors from "cors";
import dbConnection, { user } from "./Database/mongoose.js";
import dotenv from "dotenv";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
dotenv.config();

const app = express();
// cors middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

//initializing db
dbConnection();

const PORT = process.env.PORT;

app.get("/auth", (req, res) => {
  const token = req.cookies.userJWT;
  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }
  Jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
  console.log("🚀 ~ file: app.js:33 ~ Jwt.verify ~ decoded:", decoded)

    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    const userData = user.find({ email: decoded.email });
    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res.json({ data: userData, success: true });
  });
});

app.post("/signup", async (req, res) => {
  try {
    // destructuring elements
    const { userName, email, password } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);
    const result = await user.create(
      {
        userName,
        email,
        password: hashedPass,
      },
    );

    //generating token
    const token = Jwt.sign({ data: result[0] }, process.env.SECRETKEY);

    //setting the cookie
    res.cookie("userJWT", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "success", success: true, data: result });
  } catch (err) {
    res.status(500).json({ message: "failed", success: false });
    throw new Error(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    //destructuring elements
    const { email, password } = req.body;

    const userExist = await user.findOne({email: email }, { password: 0 });
    if (!userExist) {
      return res.json({ message: "failed", success: false });
    }
    let checkCondition = await bcrypt.compare(password,userExist.password)
    if(checkCondition) {

      //setting the cookie
       //generating token
    const token = Jwt.sign({ data: userExist }, process.env.SECRETKEY);
      res.cookie("userJWT", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ message: "success", success: true, data: userData });
    } else {
      return res.json({
        message: "email or password is incorrect",
        success: false,
      });
    }
  } catch (err) {
    res.json({ message: "failed", success: false });
    throw new Error(err);
  }
});

// server listening on PORT
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
