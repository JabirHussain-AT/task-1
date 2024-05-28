import mongoose from "mongoose";

export default () => {
  mongoose
    .connect(process.env.MONGOURL)
    .then(() => {
      console.log("connected succesfully");
    })
    .catch(() => {
      console.log("connection db failed !");
    });
};

export const userSchema = {
  userName: String,
  email: String,
  password: String,
};

export const user = mongoose.model("User", userSchema);
