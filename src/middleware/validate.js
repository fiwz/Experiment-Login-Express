import { validationResult } from "express-validator"; // The validationResult returns an array of errors, if any.

const Validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let error = {};

    console.log(errors)
    errors.array().map((err) => (error[err.path] = err.msg));
    return res.status(422).json({ error });
  }
  next();
}

export default Validate; // only export single value of this (current) module