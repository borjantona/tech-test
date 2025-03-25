import { useCallback, useEffect } from "react";
import { useApiFetcher } from "../api/useApiFetcher";
import { AuthContextValue } from "./AuthContext";

interface UserFetch {
  fetchUser: () => Promise<void>;
  refreshUserToken: () => Promise<void>;
}

function useUserFetch(context: AuthContextValue): UserFetch {
  const fetcher = useApiFetcher();

  const { tokens, setTokens, setCurrentUser } = context;

  const refreshUserToken = useCallback(async () => {
    if (tokens?.refresh) {
      const res = await fetcher(
        "POST /v3/auth/refresh",
        { data: { refreshToken: tokens.refresh } },
        { headers: { Authorization: `Bearer ${tokens.access}` } }
      );
      if (!res.ok) {
        setCurrentUser(null);
        throw new Error(res.data.message);
      } else {
        setTokens({
          access: res.data.accessToken,
          accessExpiresAt: res.data.accessTokenExpiresAt,
          refresh: res.data.refreshToken,
          refreshExpiresAt: res.data.refreshTokenExpiresAt,
        });
      }
      return Promise.resolve();
    } else {
      throw new Error("No user to refresh.");
    }
  }, [tokens, setTokens, setCurrentUser, fetcher]);

  const fetchUser = useCallback(async () => {
    const res = await fetcher(
      "GET /v1/users/me",
      {},
      { headers: { Authorization: `Bearer ${tokens?.access}` } }
    );
    if (!res.ok) {
      if (res.status === 403) {
        console.error("User not authorized");
      }
      throw new Error(res.data.message);
    }
    setCurrentUser({
      userId: res.data.userId,
      name: res.data.displayName,
      email: res.data.email ?? "",
    });
  }, [tokens, fetcher, setCurrentUser]);

  useEffect(() => {
    if (tokens !== null && tokens) {
      fetchUser().catch((err: Error) => {
        console.error(err);
      });
    }
  }, [tokens, fetchUser]);

  return { fetchUser, refreshUserToken };
}

export { useUserFetch };
