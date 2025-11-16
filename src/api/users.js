import {API_BASE_URL} from "../config/api.js"


const API_URL = `${API_BASE_URL}/users`;

export async function checkIfUserExists(username) {
  try {
    console.log(`Checking username: ${username}`);
    const userResponse = await fetch(`${API_URL}?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    if (!userResponse.ok) {
      throw new Error(`Lỗi kiểm tra tên người dùng: HTTP ${userResponse.status}`);
    }
    const existingUsers = await userResponse.json();
    console.log("Existing users:", existingUsers);
    if (!Array.isArray(existingUsers)) {
      throw new Error("Phản hồi username không phải mảng");
    }
    if (existingUsers.length > 0) {
      return { exists: true, message: "Tên người dùng đã tồn tại, vui lòng chọn tên khác" };
    }

    return { exists: false };
  } catch (error) {
    console.error("Lỗi khi kiểm tra người dùng:", error);
    return { exists: true, message: `Lỗi khi kiểm tra thông tin người dùng: ${error.message}` };
  }
}

export async function registerUser(userData) {
  try {
    console.log("Registering user with data:", userData);
    const registerResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        gender: userData.gender,
        address: userData.address,
        password: userData.password,
        f_name: userData.f_name,
        l_name: userData.l_name,
        dob: { $date: userData.dob.toISOString() },
        avatar: userData.avatar || "https://res.cloudinary.com/dqnj8bsgu/image/upload/v1746630940/avatar_f6yerg.jpg",
        role: userData.role || "user",
        status: userData.status || "active",
        created_at: new Date().toISOString()
      })
    });
    if (!registerResponse.ok) {
      console.log("Register response:", registerResponse.status, registerResponse.statusText);
      const errorData = await registerResponse.text();
      console.log("Error response body:", errorData);
      throw new Error(`Lỗi đăng ký người dùng: HTTP ${registerResponse.status} - ${errorData}`);
    }

    const responseData = await registerResponse.json();
    console.log("Register success:", responseData);
    return responseData;
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    throw error;
  }
}
export async function getUsers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${userId}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    return await getUserById(1);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function updateUser(userId, userData) {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update user ${userId}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
}

export async function createUser(userData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}