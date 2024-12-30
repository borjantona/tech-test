import { Auth } from './types'
import { useApiFetcher } from "../api";

/**
 * Returns the current auth state. See {@link Auth} for more information on
 * what is included there.
 *
 * @throws {TypeError} if called from a component not descendant of AuthProvider
 */
function useAuth(): Auth {
   const fetcher = useApiFetcher();

  return {
    tokens: null,
    currentUser: null,
    async login(credentials) {
      const { email, password } = credentials;
	  const res = await fetcher("POST /v3/auth/login", {
        data: { email, password },
      });
      if (!res.ok) {
        throw new Error(res.data.message);
      }
      if (
        typeof res.data.accessToken === "string" &&
        typeof res.data.accessTokenExpiresAt === "string" &&
        typeof res.data.refreshToken === "string" &&
        typeof res.data.refreshTokenExpiresAt === "string"
      ) {
		return Promise.resolve();
      } else {
        throw new Error("Not matching data from the API.");
      }
    },
    logout() {
      return Promise.reject(new Error('Not yet implemented'))
    },
  }
}

export { useAuth }
