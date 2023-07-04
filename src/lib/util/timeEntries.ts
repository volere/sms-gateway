import { connectToDatabase } from "../mongo";
import { FindEmployee, updateEmployee } from "../mongo/employees";
import Fetcher from "./clockify";

const workspace = process.env.CLOCKSPACE as string;

export const stopClock = async (phone: string) => {
  const query = { phone: phone };
  const options = {};
  let removeJobMSG;
  const { db } = await connectToDatabase();
  const user = await FindEmployee(query, options, db);

  const formattedDate = setCurrentDateAndTime();

  const dest = `/user/${user.clockifyId}/time-entries`;
  const method = "POST";
  console.log("DATE:  ", user.activeJob.start);
  console.log("StartDATE:  ", formattedDate);
  const payload = {
    billable: false,
    start: user.activeJob.start,
    end: formattedDate,
    projectId: user.activeJob.projectId,
  };

  const stopClock = await Fetcher({
    dest: dest,
    method: method,

    payload: payload,
  });
  console.log("Payload", payload);
  if ((stopClock.status = 201)) {
    const filter = {
      _id: user._id,
    };

    const update = {
      $unset: { activeJob: null },
    };
    removeJobMSG = await db
      .collection("employees")
      .updateOne(filter, update, options);
  }
  return { stopClock, removeJobMSG };
};

export const startClock = async (phone: string) => {
  const formattedDate = setCurrentDateAndTime();

  const filter = { phone: phone };
  const updateDoc = {
    activeJob: { start: formattedDate, projectId: process.env.GENERALPROJECT },
  };
  const options = { upsert: false };

  const document = await updateEmployee(filter, updateDoc, options);

  return document;
};

export const startNoPhone = async () => {
  // Connect to the database

  const formattedDate = setCurrentDateAndTime();
  // Perform a simple operation like fetching a document
  const filter = { clockifyId: process.env.NOPHONEGUY };

  const updateDoc = {
    activeJob: { start: formattedDate, projectId: process.env.GENERALPROJECT },
  };
  const options = { upsert: true };

  const document = await updateEmployee(filter, updateDoc, options);

  return document;
};

export const stopNoPhone = async () => {
  const query = { clockifyId: process.env.NOPHONEGUY };
  const options = {};
  let removeJobMSG;
  const { db } = await connectToDatabase();
  const user = await FindEmployee(query, options, db);

  const formattedDate = setCurrentDateAndTime();

  const dest = `/user/${user.clockifyId}/time-entries`;
  const method = "POST";
  console.log("DATE:  ", user.activeJob.start);
  console.log("StartDATE:  ", formattedDate);
  const payload = {
    billable: false,
    start: user.activeJob.start,
    end: formattedDate,
    projectId: user.activeJob.projectId,
  };

  const stopClock = await Fetcher({
    dest: dest,
    method: method,
    payload: payload,
  });
  console.log("Payload", payload);
  if ((stopClock.status = 201)) {
    const filter = {
      _id: user._id,
    };

    const update = {
      $unset: { activeJob: null },
    };
    removeJobMSG = await db
      .collection("employees")
      .updateOne(filter, update, options);
  }
  return { stopClock, removeJobMSG };
};
function setCurrentDateAndTime() {
  const today = new Date();
  const formattedDate = today.toISOString();
  return formattedDate;
}
