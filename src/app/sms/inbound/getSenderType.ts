import { connectToDatabase } from "@/lib/mongo";
import { stripeConfig } from "@/lib/util";

export async function getSenderType(From: string) {
  const stripe = stripeConfig;
  const { db } = await connectToDatabase();
  try {
    let senderType = "unknown";
    const ownerPhoneNumber = process.env.MASTER_PHONE;

    if (!ownerPhoneNumber) {
      console.error("MASTER_PHONE environment variable is not set.");
      return senderType;
    }

    const EmployeeLookup = await db
      .collection("employees")
      .findOne({ phone: From });
    console.log("emp:$$$", EmployeeLookup);
    if (EmployeeLookup) {
      if (From === EmployeeLookup.phone) {
        switch (EmployeeLookup.role) {
          case "admin":
            senderType = "owner";
            break;
          case "double":
            senderType = "double";
            break;
          default:
            senderType = "generalEmployee";
            break;
        }
      }
    } else {
      const customers = await stripe.customers.search({
        query: `phone: \'${From}\'`,
      });

      if (customers.data.length > 0) {
        senderType = "customer";
      } else {
        const potentialLead = await db
          .collection("potentialLeads")
          .findOne({ phoneNumber: From });
        if (potentialLead) {
          senderType = "potentialLead";
        }
      }
    }

    return senderType;
  } catch (error) {
    console.error("Error while getting sender type: ", error);
    return "unknown";
  }
}
