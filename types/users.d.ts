interface TempUser {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  business_type: string;
  address?: string;

  country?: string;
}

type status = "active" | "overdue" | "pending" | "attention" | "disabled";
interface userObject {
  _id?: string;
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  clockifyId?: string;
  stripeCustId?: string;
  stripeAccountId?: string;
  account_Status?: status;
  business_name?: string;
  business_type?: string;
  role?: string;
  subscription_plan?: string;
  accountStatus?: status;
  rate?: number;
  BusinessPhone?: string;
  TwilioPhone?: string;
  clockspace?: string;

  //requirements?:object
}
interface EmployeeOBJ extends userObject {
  address?: string;
  phone: string;
  country?: string;
}
