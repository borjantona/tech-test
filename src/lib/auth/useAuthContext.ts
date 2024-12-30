import { useContext } from "react";
import { AuthContext, AuthContextValue } from "./AuthContext";

export const useAuthContext = (): AuthContextValue => {
	return useContext(AuthContext);
};