import { connectToDatabase } from "@/lib/mongo";
import { NextApiRequest, NextApiResponse } from "next";

import twilio from "twilio";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    // Replace these with actual validation and fetching from session or token
    const ownerId = "ownerIdentifier";
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Invalid message" });
    }

    const db = await connectToDatabase();
    const collection = db.collection("mappings");

    const mapping = await collection.findOne({ ownerId });

    if (!mapping) {
      return res
        .status(400)
        .json({ message: "No mapping found for this owner" });
    }

    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: mapping.customerPhone,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Could not process your request: ${error.message}` });
  }
}
