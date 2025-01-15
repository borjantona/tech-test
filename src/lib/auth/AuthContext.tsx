import React, { ReactNode, useEffect, useState } from "react";
import { TokensData, UserData } from "../auth/types";
import { AuthProviderProps } from "./AuthProvider";
import { useApiFetcher } from "../api";

export interface AuthContextValue {
  /**
   * The current user's information.
   *
   * If `undefined`; it means the auth state is still loading.
   */
  currentUser: UserData | undefined | null;

  /**
   * Currently logged-in user token information or `null` if there isn't any.
   *
   * Note: once this value transitions from `undefined` into any other value; it will
   * never go-back into being `undefined` again
   */
  tokens: undefined | null | TokensData;

  /**
   * Setters for the tokens and the currentUser data
   */
  setTokens: ((tokens: TokensData | null) => void);
  setCurrentUser: ((user: UserData | undefined | null) => void);
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

interface AuthContextProviderProps extends Partial<AuthProviderProps> {
  children?: ReactNode;
}

/**
 * Allows configuring the default behavior of the API fetcher.
 */
function AuthContextProvider(props: AuthContextProviderProps) {
  const { initialTokens, onAuthChange, children } = props;

  const [tokens, setTokens] = useState<null | TokensData | undefined>(
    undefined
  );
  const [currentUser, setCurrentUser] = useState<UserData | undefined | null>(
    undefined
  );

  const fetcher = useApiFetcher();

  useEffect(() => {
    if (initialTokens instanceof Promise) {
      (initialTokens)
        .then((res) => {
          if (res !== null) {
            setTokens(res);
          } else {
            setCurrentUser(null);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [initialTokens]);

  useEffect(() => {
    if (tokens !== null && tokens) {
      const fetchUser = async (token: string) => {
        const res = await fetcher(
          "GET /v1/users/me",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          if (res.status === 403) {
            const resRefresh = await fetcher(
              "POST /v3/auth/refresh",
              { data: { refreshToken: tokens.refresh } },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!resRefresh.ok) {
              throw new Error("No refresh token available");
            }
            setTokens({
              access: resRefresh.data.accessToken,
              accessExpiresAt: resRefresh.data.accessTokenExpiresAt,
              refresh: resRefresh.data.refreshToken,
              refreshExpiresAt: resRefresh.data.refreshTokenExpiresAt,
            });
          }
          throw new Error(res.data.message);
        }
        setCurrentUser({
          userId: res.data.userId,
          name: res.data.displayName,
          email: res.data.email ?? "",
        });
      };
      fetchUser(tokens.access).catch((err: Error) => {
        console.error(err);
      });
    }
  }, [tokens, fetcher, setCurrentUser]);

  useEffect(() => {
    if (tokens !== undefined) {
      if (typeof onAuthChange === "function") {
        onAuthChange(tokens);
      }
    }
  }, [tokens, onAuthChange]);

  const value = {
    currentUser,
    tokens,
    setTokens,
    setCurrentUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthContextProvider };
