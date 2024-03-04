import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import BlacklistToken from '../models/BlacklistToken.js';
import { SECRET_ACCESS_TOKEN } from '../config/index.js';

// Using arrow function, but not recommended using arrow functions for declare method
// const Verify = async (req, res, next) => {
// }

export async function Verify(req, res, next) {
  try {
    const authHeader = req.headers["cookie"]; // get the session cookie from request headers

    console.log('req.headers', req.headers)

    if (!authHeader) return res.sendStatus(401);  // if there is no cookie from request header, send an unauthorized response.
    const cookie = authHeader.split("=")[1]; // If there is, split the cookie string to get the actual jwt

    // Check cookie to determine whether it is blacklisted
    // If on blacklisted, ask for relogin, otherwise call the next function
    const accessToken = cookie.split(';')[0];
    const checkIfBlacklisted = await BlacklistToken.findOne( {token: accessToken} );
    // if true, send an unathorized message, asking for a re-authentication.
    if (checkIfBlacklisted)
      return res
        .status(401)
        .json({ message: "This session has expired. Please login"})

    // if token has not been blacklisted, verify with jwt to see if it has been tampered with or not.
    // that's like checking the integrity of the accessToken

    // Verify using jwt to see if token has been tampered with or if it has expired.
    // that's like checking the integrity of the cookie
    jwt.verify(cookie, SECRET_ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        // if token has been altered or has expired, return an unauthorized error
        return res
          .status(401)
          .json({ message: "This session has expired. Please login"})
      }

      const { id } = decoded; // get user id from the decoded token
      const user = await User.findById(id); // find user by id
      const { password, ...data } = user._doc; // return user object without the password (rest operator)
      req.user = data;
      next();
    });

  } catch (err) {
    console.error("Error in verify.js Verify()", err);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    })
  }
}

/**
 * Verify Role
 * The VerifyRole middleware checks the user object to determine if the user is an admin or not.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export function VerifyRole (req, res, next) {
  try {
    const user = req.user; // we have access to the user object from the request
    const { role } = user; // extract the role from user

    // check if user has no advance privileges
    // return an unauthorized response
    if (role !== "0x88") {
      // role is not admin
      return res.status(403).json({
        status: "error",
        code: 403,
        data: [],
        message: "You don not have permission to access this resource"
      });
    }
    next(); // continue to next middleware or function
  } catch (err) {
    console.error("Error in verify.js VerifyRole() ", err);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    })
  }
}