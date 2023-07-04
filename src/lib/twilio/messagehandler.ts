import { connectToDatabase } from "../mongo";
import { findConversation } from "../mongo/findConversation";
import saveMsg from "../mongo/savemsg";
import { ChatGPTRes } from "../util";
import {
  startClock,
  startNoPhone,
  stopClock,
  stopNoPhone,
} from "../util/timeEntries";
import { sendText } from "./sendtext";

const ownerPhoneNumber = process.env.MASTER_PHONE as string; // Replace with the owner's phone number

function parseMessage(input: string): OutgoingMessage {
  const regex = /^\+1(\d{10}):(.*)$/;
  const match = input.match(regex);
  if (match) {
    return {
      phoneNumber: match[1],
      message: match[2],
    };
  } else {
    return null;
  }
}
export const handlePotentialLead = async (Body: string, From: string) => {
  const { db } = await connectToDatabase();
  console.log("Message from potential lead");
  await db
    .collection("potentialLeads")
    .insertOne({ phoneNumber: From, message: Body });
  await saveMsg({ phone: From, msg: Body });
  await sendText(process.env.MASTER_PHONE!, `${From}: ${Body}`);
};

export const handleOwnerMessage = async (Body: string, From: string) => {
  // Handle owner's message
  console.log("Message from owner");
  const gptMatch = gptREGMatch(Body);
  const OutgoingMessage = parseMessage(Body);

  if (gptMatch) {
    console.log("GPT match found");
    const x = gptMatch[1].trim(); // Extract the parameter after "GPT? "
    console.log("Parameter extracted:", x);
    const responseText = await ChatGPTRes(x);
    console.log("GPT response:", responseText);
    await sendText(`GPT: ${responseText}`, From);
  } else if (typeof OutgoingMessage?.phoneNumber == "string") {
    try {
      //What do you do with the conversation message?
      const message = await findConversation(OutgoingMessage?.phoneNumber);
    } catch (err) {
      console.log("SMS conversation could not be found", err);
      await sendText(`SMS ERIR: ${err}`, ownerPhoneNumber);
      await ownerCommands(Body, From);
    }
  } else {
    console.log("GPT match not found");
    await sendText("What do you require sir?", ownerPhoneNumber);
    await ownerCommands(Body, From);
  }
};

export const handleSupervisor = async (Body: string, From: string) => {
  switch (Body.toLowerCase()) {
    case "both in":
      await startClock(From);
      await startNoPhone();
      await sendText(" Both clocked In", From);
      break;
    case "both out":
      await stopClock(From);
      await stopNoPhone();
      await sendText(" Both  Clocked out", From);
      break;
    case "in":
      await startClock(From);
      await sendText("Clocked In", From);
      break;
    case "out":
      await stopClock(From);
      await sendText("Clocked Out", From);
      break;
    default:
      await sendText(
        "msg not received. Commands are: \n in \n out \n both in \n both out",
        From
      );
      break;
  }
};

export const handleGeneralEmployee = async (Body: string, From: string) => {
  console.log("Message from general employee");
  const gptMatch = gptREGMatch(Body);
  if (gptMatch) {
    console.log("GPT match found");
    const x = gptMatch[1].trim(); // Extract the parameter after "GPT? "
    console.log("Parameter extracted:", x);
    const responseText = await ChatGPTRes(x);
    console.log("GPT response:", responseText);
    await sendText(`GPT: ${responseText}`, From);
  } else {
    switch (Body.toLowerCase()) {
      case "in":
        await startClock(From);
        await sendText("Clocked In", From);
        break;
      case "out":
        await stopClock(From);
        await sendText("Clocked Out", From);
        break;
      default:
        await sendText("msg not received. Commands are: \n in \n out", From);
        break;
    }
  }
};

export const handleCurrentCustomer = async (Body: string, From: string) => {
  console.log("Message from current customer");
  await saveMsg({ phone: From, msg: Body });
  await sendText(process.env.MASTER_PHONE!, `${From}: ${Body}`);
};

export const ownerCommands = async (Body: string, From: string) => {
  switch (Body.toLowerCase()) {
    case "a in":
      await startNoPhone();
      await sendText(" A clocked In", From);
      break;
    case "a out":
      await stopNoPhone();
      await sendText(" A clockedout", From);
      break;
    case "in":
      await startClock(From);
      await sendText("clocked In", From);
      break;
    case "out":
      await stopClock(From);
      await sendText("clocked Out", From);
      break;
    default:
      await sendText(
        "msg not received. Commands are: \n in \n out \n A in \n A out \npayroll",
        From
      );
      break;
  }
};
function gptREGMatch(Body: string) {
  const gptRegex = /^\s*GPT\?*\s*(.*)$/;
  const gptMatch = Body.match(gptRegex);
  return gptMatch;
}
