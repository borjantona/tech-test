import React, { ReactNode, useEffect, useRef, useState } from "react";
import { TokensData, UserData } from "../auth/types";
import { AuthProviderProps } from "./AuthProvider";
import { useUserFetch } from "./useUserFetch";

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
  setTokens: (tokens: TokensData | null) => void;
  setCurrentUser: (user: UserData | undefined | null) => void;
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

  const refreshUserTimer = useRef<NodeJS.Timeout | null>(null);

  const { refreshUserToken } = useUserFetch({
    currentUser,
    tokens,
    setTokens,
    setCurrentUser,
  });

  useEffect(() => {
    if (initialTokens instanceof Promise) {
      const getInitialTokens = async () => {
        const tokens = await initialTokens;
        if (tokens !== null) {
          setTokens(tokens);
        } else {
          setCurrentUser(null);
        }
      };
      getInitialTokens().catch((error) => {
		setCurrentUser(null);
        console.log(error);
      });
    }
  }, [initialTokens]);

  useEffect(() => {
    if (tokens !== undefined) {
      if (typeof onAuthChange === "function") {
        onAuthChange(tokens);
      }
    }
    if (refreshUserTimer.current !== null) {
      clearTimeout(refreshUserTimer.current);
    }
    if (tokens !== null && tokens !== undefined) {
      const expiresAt = new Date(tokens.accessExpiresAt).getTime() - Date.now();
      refreshUserTimer.current = setTimeout(() => {
        const refresh = async () => {
          await refreshUserToken();
        };
        refresh().catch((error) => {
          console.error("Error refreshing user token", error);
        });
      }, expiresAt - 1000);
    }
  }, [tokens, onAuthChange, refreshUserToken]);

  const value = {
    currentUser,
    tokens,
    setTokens,
    setCurrentUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthContextProvider };
