// Centralized frontend config. Tweak these or set Vite env vars to switch
// between the mock backend and your real Node.js API.
const env = (import.meta as any).env ?? {};

export const config = {
  apiUrl: (env.VITE_API_URL as string) || "http://localhost:4000/api",
  googleClientId: (env.VITE_GOOGLE_CLIENT_ID as string) || "mock-google-client-id",
  // When true, the axios layer is short-circuited by an in-memory mock so the
  // UI is fully usable without a running backend. Flip to false once your
  // Node.js backend is up.
  useMock: env.VITE_USE_MOCK === "true",
};
