import { Stripe } from "stripe";

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
