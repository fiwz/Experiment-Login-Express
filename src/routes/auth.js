import express from 'express';
import { Register } from '../controllers/auth.js';
import { check } from 'express-validator';
import Validate from '../middleware/validate.js';
import { Login, Logout } from '../controllers/auth.js';

const router = express.Router();

// Register route -- POST request
router.post(
  '/register',
  check('email')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .normalizeEmail(),
  check('first_name')
    .not()
    .isEmpty()
    .withMessage('Your first name is required.')
    .trim()
    .escape(),
  check('last_name')
    .not()
    .isEmpty()
    .withMessage('Your last name is required.')
    .trim()
    .escape(),
  check('password')
    .notEmpty()
    .isLength({ min:8 })
    .withMessage('Password must be at least 8 characters long.'),
  Validate,
  Register
);

// Login route -- POST request
router.post(
  '/login',
  check('email')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .normalizeEmail(),
  check('password')
    .not()
    .isEmpty(),
  Validate,
  Login
);

// Logout route
// If you don't like seeing JWT in cookies, you can encrypt it or use express-session as an alternative to ordinary JWT.
router.get('/logout', Logout);

export default router;
