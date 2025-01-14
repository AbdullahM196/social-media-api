import mongoose from "mongoose";
export default class DBConnect {
  private static instance: DBConnect;
  private databaseUri: string;
  private constructor() {
    this.databaseUri = process.env.MONGODB_URI;
  }

  public static getInstance(): DBConnect {
    if (!DBConnect.instance) {
      DBConnect.instance = new DBConnect();
      return DBConnect.instance;
    }
    return DBConnect.instance;
  }
  public async ConnectDB() {
    try {
      await mongoose.connect(this.databaseUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log("Database connected successfully");
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
}
