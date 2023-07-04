import {
  handleOwnerMessage,
  handleDoubleEmployee,
  handleGeneralEmployee,
  handleCurrentCustomer,
  handlePotentialLead,
} from "@/lib/twilio/messagehandler";
import { Body } from "twilio/lib/twiml/MessagingResponse";
import { getSenderType } from "./getSenderType";

export async function handleIncomming(Body: string, From: string) {
  const senderType = await getSenderType(From);
  console.log(senderType);
  const handlers: { [key: string]: (body: string, from: string) => void } = {
    owner: handleOwnerMessage,
    supervisor: handleSupervisor,
    generalEmployee: handleGeneralEmployee,
    currentCustomer: handleCurrentCustomer,
    potentialLead: handlePotentialLead,
  };

  if (handlers[senderType]) {
    await handlers[senderType](Body, From);
  } else {
    throw Error;
  }
}
