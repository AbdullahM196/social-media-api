import { config } from "dotenv";
config();
const allowedOrigins = process.env.Allowed_Origins?.split(",");

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void => {
    if (!origin) {
      callback(null, true);
    } else if (allowedOrigins?.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed By Cors"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
export default corsOptions;
