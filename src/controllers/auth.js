import bcrypt from "bcrypt";
import User from "../models/User.js";
import BlacklistToken from "../models/BlacklistToken.js";

const errorCode = 500;
const errorDataReturn = {
  status: 'failed',
  data: [],
  message: 'Internal server error occurred. Please try again.',
};

/**
 * @route POST v1/auth/register
 * @desc Register a user
 * @access public
 */
export async function Register(req, res) {
  // get required variables from request body
  // using es6 object destructuring
  const { first_name, last_name, email, password } = req.body;
  try {
    // create an instance of a user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password
    });

    // validate whether the user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res.status(400).json({
        status: 'failed',
        data: [],
        message: 'It seems like you already have an account, please log in instead.',
      });

      // save new user to database
      const savedUser = await newUser.save();
      const { role, password: hashPassword, ...user_data } = savedUser._doc; // mongoose return data in _doc object
      // assign value from savedUser variable to "role" variable
      // and assign "password" from savedUser to "hashPassword" variable

      res.status(200).json({
        status: 'success',
        data: [user_data],
        message: 'Thank you for registering with us. Your account has been successfully created.',
      });

  } catch (err) {
    console.log('Error register user', err);
    res.status(errorCode).json(errorDataReturn);
  }
  res.end();
}

/**
 * @route POST v1/auth/login
 * @desc user login
 * @access Public
 */
export async function Login (req, res) {
  // get variables for the login process
  let { password: inputPassword, email } = req.body;
  try {
    // check if the user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: 'failed',
        data: [],
        message: 'Invalid email or password. Please try again with the correct credentials.',
      });
    }

    // user exists condition
    const isPasswordValid = bcrypt.compare(
      `${inputPassword}`, user.password
    );
    // validate user password
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'failed',
        data: [],
        message: 'Invalid email or password. Please try again with the correct credentials.',
      });
    }

    // generate user jwt token and cookie
    let options = {
      maxAge: 20 * 60 * 1000, // expire in 20 minutes
      httpOnly: true, // the cookie is only accessible by the web server
      secure: true,
      sameSite: "None"
    };
    const token = user.generateAccessToken(); // generate session token for user
    res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request

    // return user info except password
    let { password, ...user_data } = user._doc;
    res.status(200).json({
      status: 'success',
      data: [user_data],
      message: 'You have successfully logged in.',
    });

  } catch (err) {
    console.log('Error login', err);
    res.status(errorCode).json(errorDataReturn);
  }
  res.end();
}

/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Public
 */
export async function Logout(req, res) {
  try {
    const authHeader = req.headers['cookie']; // get the session cookie from request header

    console.log('authHeader = ', authHeader);

    if (!authHeader) return res.sendStatus(204); // no content
    const cookie = authHeader.split('=')[1]; // if cookie is present, split the cookie strng to get the actual jwt token
    const accessToken = cookie.split(';')[0];

    // Check if that token is blacklisted
    const checkIfBlacklisted = await BlacklistToken.findOne( {token: accessToken} );
    if (checkIfBlacklisted) return res.sendStatus(204); // if true, send a no content response.

    // otherwise blacklist the token
    const newEntry = new BlacklistToken({
      token: accessToken
    });
    await newEntry.save();

    // Also clear the request cookie on client
    res.setHeader('Clear-Site-Data', '"cookies"'); // (not working)
    res.cookie("SessionID", ''); // ini mah nyobain aja (berhasil)
    res.status(200).json({
      status: 'success',
      data: [],
      message: "You are logged out!"
    });

  } catch (err) {
    console.log('Error logout', err);
    res.status(errorCode).json(errorDataReturn);
  }
  res.end();
}

// export { Register }; // export many values
// export default Register; // export default values of this module when another file is importing this file (module)