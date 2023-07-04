export default async function Fetcher({
  dest,
  method,
  payload,
  workspace,
}: {
  dest: string;
  method: string;
  payload?: object;
  workspace?: string;
}) {
  // Validate the method
  const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  if (!allowedMethods.includes(method.toUpperCase())) {
    throw new Error(
      "Invalid method: Must be one of GET, POST, PUT, PATCH, or DELETE."
    );
  }
  const workspaceID = process.env.CLOCKSPACE;
  const url = `https://api.clockify.me/api/v1/workspaces/${workspaceID}/${dest}`;

  const fetchOptions: RequestInit = {
    method: method,
    headers: {
      "content-type": "application/json",
      "X-Api-Key": process.env.CLOCKIFY as string,
    },
  };

  // Add payload to the fetch options if the method requires it
  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(payload);
  }

  const response = await fetch(url, fetchOptions);
  console.log("Clockify Fetcher Response status:", fetchOptions);
  if (!response.ok) {
    const responseText = await response.text();
    console.log("Clockify Fetcher Response status:", response.status);
    console.log("Clockify Fetcher Response text:", responseText);
    console.log(response);
    throw new Error(
      `CLOCKIFY Fetcher Error: ${response.status} - ${responseText}`
    );
  }

  return response.json();
}
