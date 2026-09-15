import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/users.api";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: ({ signal }) => getUserProfile(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
