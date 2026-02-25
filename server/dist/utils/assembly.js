"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = new URL("https://streaming.assemblyai.com/v3/token");
url.search = new URLSearchParams({
    expires_in_seconds: "60",
}).toString();
const getAssemblyToken = async (apiKey) => {
    const response = await fetch(url.toString(), {
        headers: {
            Authorization: apiKey,
        },
    });
    if (!response.ok) {
        console.error('Error', response);
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.token;
};
exports.default = getAssemblyToken;
//# sourceMappingURL=assembly.js.map