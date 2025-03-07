import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { config } from "dotenv";

config();
const MongoStore = connectMongo(session);
const store = new MongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
export default session({
  secret: process.env.SESSION_SECRET!,
  saveUninitialized: false,
  resave: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "none",
    secure: false,
  },
});
