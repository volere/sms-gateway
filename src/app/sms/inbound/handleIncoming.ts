import {
  handleOwnerMessage,
  handleDoubleEmployee,
  handleGeneralEmployee,
  handleCurrentCustomer,
  handlePotentialLead,
  handleSpam,
  handleUnknown,
} from "@/lib/twilio/messagehandler";
import { Body } from "twilio/lib/twiml/MessagingResponse";
import { getSenderType } from "./getSenderType";

export async function handleIncomming(Body: string, From: string) {
  const senderType = await getSenderType(From);
  console.log(senderType);
  const handlers: { [key: string]: (body: string, from: string) => void } = {
    owner: handleOwnerMessage,
    double: handleDoubleEmployee,
    generalEmployee: handleGeneralEmployee,
    currentCustomer: handleCurrentCustomer,
    potentialLead: handlePotentialLead,
    spam: handleSpam,
    unknown: handleUnknown,
  };

  if (handlers[senderType]) {
    await handlers[senderType](Body, From);
  } else {
    await handleUnknown(From);
  }
}
