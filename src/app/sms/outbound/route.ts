import { connectToDatabase } from "@/lib/mongo";
import { ROOT_URL } from "@/lib/util";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { parse } from "postcss";

import twilio from "twilio";
import request from "twilio/lib/http/request";

export default async function POST(request: NextRequest) {
  try {
    const res = NextResponse;

    if (typeof request.body == null) {
      return false;
    }

    const input = await request.body!.getReader().read();
    const decoder = new TextDecoder();
    const string = decoder.decode(input.value);
    const body = parse(string) as unknown as SMS;
    // Replace these with actual validation and fetching from session or token
    const ownerId = process.env.MAINPHONE;
    const message = body.Body;

    console.log("HUH", body);
    //const data = request.body;
    console.log("data", body.Body);

    const headersList = headers();
    const twilioSignature = headersList.get("x-twilio-signature") as string;

    const Fullurl =
      process.env.VERCEL_ENV == "development"
        ? process.env.TEST_URL
        : `${ROOT_URL}${request.url}`;

    if (!Fullurl || typeof twilioSignature != "string") {
      return res.json({ status: 403 });
    }

    if (
      //@ts-ignore
      !checkSignature(authToken, Fullurl, prepareParams(body), twilioSignature)
    ) {
      return res.json({ error: "Invalid request signature" }, { status: 403 });
    }

    if (typeof body.From != "string" || typeof body.Body !== "string") {
      return res.json({ error: "Invalid request " }, { status: 400 });
    }

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
