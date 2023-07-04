import { connectToDatabase } from ".";

export const findConversation = async (phonenumber: string) => {
  const { db } = await connectToDatabase();
  const smsConversations = db.collection("conversations");
  const conversation = await smsConversations.findOne(
    { phone: phonenumber },
    {
      //@ts-ignore
      messages: {
        $last: 1,
      },
    }
  );

  return conversation;
};
