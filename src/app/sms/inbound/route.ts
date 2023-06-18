import { connectToDatabase } from "@/lib/mongo";
import { checkSignature, prepareParams } from "@/lib/twilio/checksig";
import {
  handleOwnerMessage,
  handleDoubleEmployee,
  handleGeneralEmployee,
  handleCurrentCustomer,
  handlePotentialLead,
  handleSpam,
  handleUnknown,
} from "@/lib/twilio/messagehandler";
import { ROOT_URL, stripeConfig } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH as string;

export async function POST(request: NextRequest) {
  const res = NextResponse;
  const body = await request;
  console.log("incoming", body);

  const { From, Body } = body;

  const headersList = headers();
  const twilioSignature = headersList.get("x-twilio-signature") as string;

  const Fullurl =
    process.env.VERCEL_ENV == "development"
      ? process.env.GPT_TESTINGLOCAL_URL
      : `${ROOT_URL}${request.url}`;

  if (!Fullurl || typeof twilioSignature != "string") {
    return res.json({ status: 403 });
  }

  if (
    !checkSignature(authToken, Fullurl, prepareParams(body), twilioSignature)
  ) {
    return res.json({ error: "Invalid request signature" }, { status: 403 });
  }

  if (typeof From != "string" || typeof Body !== "string") {
    return res.json({ error: "Invalid request " }, { status: 400 });
  }

  try {
    return res.json({ message: "Message received" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500 });
  }
}
