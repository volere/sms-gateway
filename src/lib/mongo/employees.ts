import { Db, OptionalId, UpdateFilter, UpdateOptions } from "mongodb";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from ".";

export async function addEmployee(employee: OptionalId<{}>) {
  const { db } = await connectToDatabase();
  // console.log(stripeIn)
  try {
    const clean = sanitize(employee);
    return db.collection("employees").insertOne(clean);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    console.log(`❌ addUser Error message: ${errorMessage}`);
    return { status: 400, msg: `addUser Error: ${errorMessage}` };
  }
}
export const updateEmployee = async (
  filter: UpdateFilter<{ [key: string]: any }>,
  updateDoc: { [key: string]: any },
  options: UpdateOptions
) => {
  const { db } = await connectToDatabase();
  try {
    const clean = sanitize(updateDoc);
    //returns matched count
    const update = { $set: clean };
    const updateEmployee = await db
      .collection("employees")
      .updateOne(filter, update, options);
    console.log("update Info", updateEmployee);
    return updateEmployee.matchedCount;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    console.log(`❌ update error: ${errorMessage}`);
    return { status: 400, msg: `update error: ${errorMessage}` };
  }
};

export async function FindEmployee(
  query: { [key: string]: any },
  options: { [key: string]: any },
  db: Db
): Promise<any> {
  console.log("query", query);
  const clean = sanitize(query);
  try {
    const employees = db.collection("employees");
    const employee = employees.findOne(clean, options);
    return employee;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    if (err! instanceof Error) console.log(`❌ Error message: ${errorMessage}`);

    return errorMessage;
  }
}
