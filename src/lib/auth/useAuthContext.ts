import { useContext } from "react";
import { AuthContext, AuthContextValue } from "./AuthContext";

export const useAuthContext = (): AuthContextValue | null => {
	return useContext(AuthContext);
};