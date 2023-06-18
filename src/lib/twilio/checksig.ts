import * as twilio from "twilio";
export function prepareParams(body: {
  [key: string]: [];
}): Record<string, any> {
  const params: Record<string, any> = {};

  // Loop through body parameters
  for (let key in body) {
    params[key] = body[key];
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

    const isValidSignature = twilio.validateRequest(
      authToken,
      twilioSignature,
      url,
      sortedParams
    );

    // if testing env return true by default, but log signature check
    if (process.env.VERCEL_ENV == "development") {
      console.log("testing url:", url);
      console.log("sigcheck, should be true: ", isValidSignature);
      return true;
    }
    if (!isValidSignature) {
      //Return error if signature is invalid
      console.error(
        "Invalid Signature: ",
        isValidSignature,
        authToken,
        twilioSignature,
        url,
        params
      );
    }
    return isValidSignature;
  } catch (error) {
    console.error("Error while checking signature: ", error);
    return false;
  }
}
