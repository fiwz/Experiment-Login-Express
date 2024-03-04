import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { SECRET_ACCESS_TOKEN } from '../config/index.js';

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      require: "Your first name is required.",
      max: 25,
      min: 2
    },
    last_name: {
      type: String,
      require: "Your last name is required.",
      max: 25,
      min: 2
    },
    email: {
      type: String,
      required: "Your email is required.",
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: "Your password is required.",
      select: false, // By default, mongoose returns the user's password anytime a query is made on that document
      max: 25,
      min: 6
    },
    role: {
      type: String,
      required: true,
      default: "0x01"
    }
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      user.password = hash;
      next();
    })
  });
});

/**
 * Add function called "generateAccessJWT" methods
 *
 * Add a generate-token function after the pre-hook function
 * Signs the user ID with a secret key and generates a unique token which expires in 20 minutes.
 * @returns
 */
UserSchema.methods.generateAccessToken = function() {
  let payload = { id: this._id };
  return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
    expiresIn: '20m'
  })
};

export default mongoose.model("users", UserSchema);