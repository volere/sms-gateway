import { Stripe } from "stripe";
import { Configuration, OpenAIApi } from "openai";
export const ROOT_URL =
  process.env.VERCEL_ENV == "development"
    ? `${process.env.VERCEL_URL}`
    : `https://${process.env.URL}`;

export const stripeConfig = new Stripe(process.env.STRIPE as string, {
  // https://github.com/stripe/stripe-node#configuration
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore "2022-08-01"
  apiVersion: null,
});

export async function ChatGPTRes(body: string) {
  console.log("content", body);
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI as string,
    });
    const openai = new OpenAIApi(configuration);
    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: body,
        },
      ],
    });
    console.log(result.data.choices[0].message?.content);
    if (typeof result.data.choices[0].message?.content != "string") {
      throw new Error("GPT ERROR< SERVER DOWN");
    }

    return result.data.choices[0].message?.content;
  } catch (err: any) {
    console.error(err.response);
    return "Error occurred while communicating with OpenAI GPT-4";
  }
}
