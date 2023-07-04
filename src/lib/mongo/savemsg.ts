import { Db, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { connectToDatabase } from ".";
import { stripeConfig } from "../util";

// Function to search for a customer in Stripe
async function searchCustomerInStripe(phone: string) {
  const stripe = stripeConfig;
  const searchCustomer = stripe.customers.search({
    query: `phone:'${phone}'`,
  });
  return await searchCustomer;
}

// Function to update client information
async function updateClient(db: Db, phone: any, msg: any) {
  const filter = { phone: phone };
  const updateDoc = {
    $push: {
      messages: [{ message: msg, date: Date.now(), _id: new ObjectId() }],
    },
    $currentDate: { lastModified: true },
  };
  const options = { upsert: false };
  return await db.collection("client").updateOne(filter, updateDoc, options);
}

// Function to save message
async function saveMessage(
  db: Db,
  doc:
    | {
        name: string | null | undefined; // Assuming the name field is "name"
        client_id: string;
        phone: string;
        msg: string;
      }
    | {
        phone: string;
        msg: string;
        name?: // Function to search for a customer in Stripe // Function to search for a customer in Stripe
        undefined; // Assuming the name field is "name"
        client_id?: string | undefined;
      }
) {
  const smsReplyCollection = db.collection("conversations");
  const filter = { phone: doc.phone };

  const date = new Date();
  const updateDoc = {
    $push: {
      client_id: doc.client_id,
      phone: doc.phone,
      name: doc.name,
      messages: [{ message: doc.msg, date: date, _id: new ObjectId() }],
    },
    $currentDate: { lastModified: true },
  };
  const options = { upsert: true };

  return await smsReplyCollection.updateOne(filter, updateDoc, options);
}

export default async function saveMsg({
  phone,
  msg,
}: {
  phone: string;
  msg: string;
}): Promise<{
  result: InsertOneResult<any>;
  updateClient: UpdateResult | undefined;
}> {
  const { db } = await connectToDatabase();

  const customer = await searchCustomerInStripe(phone);

  let updatedClient;
  let doc;

  // If the customer is found in Stripe
  if (customer.data.length > 0) {
    updatedClient = await updateClient(db, phone, msg);
    doc = {
      name: customer.data[0].name, // Assuming the name field is "name"
      client_id: updatedClient.upsertedId
        ? updatedClient.upsertedId
        : undefined,
      phone: phone,
      msg: msg,
    };
  } else {
    // If the customer is not found in Stripe
    doc = {
      phone: phone,
      msg: msg,
    };
  }

  const result = await saveMessage(db, doc);

  return { result: result, updateClient: updatedClient };
}
