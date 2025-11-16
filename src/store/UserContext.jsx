import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
  }, []);

  const login = (userInfo, token) => {
    setUser(userInfo);
    setAccessToken(token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    localStorage.setItem("accessToken", token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider
      value={{ user, accessToken, login, logout, setAccessToken }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
