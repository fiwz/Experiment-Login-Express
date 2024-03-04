import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import mongoose from 'mongoose'; // using mongodb cloud
import { mongoose } from './config/db_connection.js'; // using mongodb local
import { PORT, URI } from './config/index.js';
import App from './routes/index.js';

// === 1 - CREATE SERVER ===
const server = express();

// CONFIGURE HEADER INFORMATION
// Allow request from any source. In real production, this should be limited to allowed origins only
server.use(cors());
server.disable('x-powered-by');
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

// === 2 - CONNECT DATABASE ===
// If using mongodb cloud
// Set up mongoose's promise to global promise
// mongoose.promise = global.Promise;
// mongoose.set("strictQuery", false);
// mongoose
//   .connect(URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(console.log("Connected to Mongo DB"))
//   .catch((err) => console.log(err))

// === 4 - CONFIGURE ROUTES ===
// Connect main route to server
server.use(App);

// === 5 - START UP SERVER ===
server.listen(PORT, () =>
  console.log(`Server running at ${PORT}`)
);
