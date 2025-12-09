import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/userService";

export function useMe(userId: string | undefined) {
  return useQuery({
    queryKey: ['me', userId],
    queryFn: () => getMe(),
    enabled: !!userId,
  });
}
