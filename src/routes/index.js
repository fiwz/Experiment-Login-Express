import express from 'express'; // import express module
import Auth from './auth.js'; // import Auth module
import { Verify, VerifyRole } from '../middleware/verify.js';

const app = express(); // create an app object of the express app instance
const URI_PREFIX = "/v1"

app.use(`${URI_PREFIX}/auth`, Auth)

app.disable('x-powered-by'); // reduce fingerprinting (optional)
// home route with the get method and handler

app.get(`${URI_PREFIX}`, (_, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: [],
      message: "Welcome to our API homepage"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error"
    });
  }
});

app.get(`${URI_PREFIX}/user`, Verify, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Dashboard!"
  });
})

app.get(`${URI_PREFIX}/admin`, Verify, VerifyRole, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "You are landing in Admin portal!"
  });
})

export default app;