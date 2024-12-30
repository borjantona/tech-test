import React, { ReactNode, useEffect, useState } from "react";
import { TokensData } from "../auth/types";
import { AuthProviderProps } from "./AuthProvider";
import { User } from "../api-types";

export interface AuthContextValue {
  /**
   * The current user's information.
   *
   * If `undefined`; it means the auth state is still loading.
   */
  currentUser: User | undefined | null;

  /**
   * Currently logged-in user token information or `null` if there isn't any.
   *
   * Note: once this value transitions from `undefined` into any other value; it will
   * never go-back into being `undefined` again
   */
  tokens: undefined | null | TokensData;

  setTokens: ((tokens: TokensData | null) => void) | null; // TODO: Documentar
  setCurrentUser: ((user: User | undefined) => void) | null; // TODO: Documentar
}

const AuthContext = React.createContext<AuthContextValue>({
  currentUser: null,
  tokens: null,
  setTokens: null, 
  setCurrentUser: null, 
});

interface AuthContextProviderProps extends Partial<AuthProviderProps> {
  children?: ReactNode;
}

/**
 * Allows configuring the default behavior of the API fetcher.
 */
function AuthContextProvider(props: AuthContextProviderProps) {
  const { onAuthChange, children } = props;

  const [tokens, setTokens] = useState<undefined | null | TokensData>(null);
  const [currentUser, setCurrentUser] = useState<User | undefined | null>(null);


  useEffect(() => {
    if (tokens) {
      if (typeof onAuthChange === 'function') {
        onAuthChange(tokens);
      }
    }
  }, [tokens]); 
  

  const value = {
      currentUser,
      tokens,
      setTokens,
      setCurrentUser,
    }
  return <AuthContext.Provider value={value}>
		{children}
	</AuthContext.Provider>;
}


export { AuthContext, AuthContextProvider };