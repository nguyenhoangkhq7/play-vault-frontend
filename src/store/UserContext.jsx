import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  // SỬA ĐỔI: Lấy dữ liệu ngay khi khởi tạo (Lazy Initialization)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

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
    // Chuyển hướng cứng về trang chủ hoặc login
    window.location.href = "/login";
  };

  const updateUser = (updatedUserData) => {
    const newUser =
      typeof updatedUserData === "function"
        ? updatedUserData(user)
        : updatedUserData;
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        setAccessToken,
        setUser: updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
