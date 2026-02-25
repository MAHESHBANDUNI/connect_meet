const url = new URL("https://streaming.assemblyai.com/v3/token");

url.search = new URLSearchParams({
  expires_in_seconds: "60",
}).toString();

interface TokenResponse {
  token: string;
}

const getAssemblyToken = async (apiKey: string): Promise<string> => {
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    console.error('Error', response);
    throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
  }

  const data: TokenResponse = await response.json();
  return data.token;
}

export default getAssemblyToken;