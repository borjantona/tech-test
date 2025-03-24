import { Auth } from "./types";
import { useApiFetcher } from "../api";
import { useAuthContext } from "./useAuthContext";

/**
 * Returns the current auth state. See {@link Auth} for more information on
 * what is included there.
 *
 * @throws {TypeError} if called from a component not descendant of AuthProvider
 */
function useAuth(): Auth {
  const fetcher = useApiFetcher();
  const context = useAuthContext();

  if (!context) {
    throw new TypeError("useAuth must be used within an AuthProvider");
  }
  const { tokens, setTokens, currentUser, setCurrentUser } = context;

  return {
    tokens,
    currentUser,
    async login(credentials) {
      const { email, password } = credentials;
      const res = await fetcher("POST /v3/auth/login", {
        data: { email, password },
      });
      if (!res.ok) {
        throw new Error(res.data.message);
      }
      setTokens({
        access: res.data.accessToken,
        accessExpiresAt: res.data.accessTokenExpiresAt,
        refresh: res.data.refreshToken,
        refreshExpiresAt: res.data.refreshTokenExpiresAt,
      });
      return Promise.resolve();
    },
    logout() {
      if (tokens === null) {
        throw new Error("No user to logout.");
      }
      setTokens(null);
      setCurrentUser(null);
      return Promise.resolve();
    }
  };
}

export { useAuth };
