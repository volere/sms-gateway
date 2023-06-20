import { checkSignature, prepareParams } from "@/lib/twilio/checksig";
import { ROOT_URL } from "@/lib/util";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { parse } from "node:querystring";
import { handleIncomming } from "./handleIncoming";
const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH as string;

export async function POST(request: NextRequest) {
  const res = NextResponse;
  try {
    if (typeof request.body == null) {
      return false;
    }
    const input = await request.body!.getReader().read();
    const decoder = new TextDecoder();
    const string = decoder.decode(input.value);
    const body = parse(string) as unknown as SMS;
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

    handleIncomming(body.Body, body.From);

    return res.json({ message: "Message received" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500 });
  }
}
