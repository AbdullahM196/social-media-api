import fs from "fs";
import postsModel from "./Models/postsModel.js";
import { config } from "dotenv";
import mongoose from "mongoose";
config();
type post = {
  author: string;
  content: string;
  img: {
    name: string;
    url: string;
  };
  createdAt: Date;
};
const DataBaseUri = "mongodb://localhost:27017/SocialMedia-app";
async () => {
  try {
    await mongoose.connect(DataBaseUri);
  } catch (error) {
    console.log({ mongooseConnectionError: (error as Error).message });
  }
};
let posts: post[] = [];
try {
  posts = JSON.parse(fs.readFileSync(`${__dirname}/_data/posts.json`, "utf-8"));
} catch (error) {
  console.log({ errorGettingData: (error as Error).message });
  console.error("Error reading file:", `${__dirname}/_data/posts.json`);
}
function getRandomDate(start: Date, end: Date): Date {
  // Ensure that start is before end
  if (start > end) {
    throw new Error("Start date must be earlier than end date.");
  }

  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime();
  const randomTimestamp =
    Math.floor(Math.random() * (endTimestamp - startTimestamp + 1)) +
    startTimestamp;
  return new Date(randomTimestamp);
}
const importData = async () => {
  if (posts.length <= 0) return;
  try {
    const startDate = new Date(2024, 9, 21); //october
    const endDate = new Date(2024, 10, 21); // november
    posts.map((post) => {
      const randomDate = getRandomDate(startDate, endDate);
      return (post.createdAt = randomDate);
    });

    await postsModel.insertMany(posts);
    console.log("Data Imported Successfully");
  } catch (error) {
    console.error("Error importing data", error);
  } finally {
    process.exit(0);
  }
};

importData();
