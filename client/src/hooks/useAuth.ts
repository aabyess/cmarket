import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // For demo purposes, return mock user data
  const mockUser = {
    id: "demo-user-1",
    email: "demo@koegyconnect.com",
    companyName: "Korea-Indonesia Trade Corp",
    companyType: "korean",
    firstName: "Demo",
    lastName: "User"
  };

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  };
}
