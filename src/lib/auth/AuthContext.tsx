import React, { ReactNode, useEffect, useState } from "react";
import { TokensData, UserData } from "../auth/types";
import { AuthProviderProps } from "./AuthProvider";

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
  setTokens: ((tokens: TokensData | null) => void) | null; 
  setCurrentUser: ((user: UserData | undefined | null) => void) | null;
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
  const [currentUser, setCurrentUser] = useState<UserData | undefined | null>(null);


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