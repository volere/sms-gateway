// saveMessage.js

import { connectToDatabase } from "@/lib/mongo";

export async function saveMessage(messageData: { phone: string; msg: string }) {
  const { db } = await connectToDatabase();
  const smsReplyCollection = db.collection("messages");
  const doc = {
    phone: messageData.phone,
    msg: messageData.msg,
  };
  const result = await smsReplyCollection.insertOne(doc);
  console.log(result.insertedId);
}

export async function categorizeMessage(messageData: {
  phone: string;
  msg: string;
}) {
  const { db } = await connectToDatabase();
  const smsReplyCollection = db.collection("messages");
  const doc = {
    phone: messageData.phone,
    msg: messageData.msg,
  };
  const result = await smsReplyCollection.insertOne(doc);
  console.log(result.insertedId);
}

export async function analyzeMessage(messageData: {
  phone: string;
  msg: string;
}) {
  const { db } = await connectToDatabase();
  const smsReplyCollection = db.collection("messages");
  const doc = {
    phone: messageData.phone,
    msg: messageData.msg,
  };
  const result = await smsReplyCollection.insertOne(doc);
  console.log(result.insertedId);
}
