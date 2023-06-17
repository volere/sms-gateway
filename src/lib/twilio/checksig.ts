import { NextApiRequest } from "next";

import * as twilio from "twilio";
export function prepareParams(req: Request): Record<string, any> {
  const params: Record<string, any> = {};

  // Loop through body parameters
  for (let key in req.body) {
    params[key] = req.body[key];
  }
  return params;
}

export function checkSignature(
  authToken: string,
  url: string,
  params: object,
  twilioSignature: string
) {
  try {
    const sortedParams = Object.fromEntries(Object.entries(params).sort());
    if (process.env.VERCEL_ENV == "development") {
      return true;
    }
    const isValidSignature = twilio.validateRequest(
      authToken,
      twilioSignature,
      url,
      sortedParams
    );

    if (!isValidSignature) {
      console.error(
        "Invalid Signature: ",
        isValidSignature,
        authToken,
        twilioSignature,
        url,
        params
      );
    }
    console.log("SIGNATURE CHECKED");
    return isValidSignature;
  } catch (error) {
    console.error("Error while checking signature: ", error);
    return false;
  }
}
