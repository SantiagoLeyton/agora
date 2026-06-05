import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { healthService } from "@/services/health-service";

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: healthService.check,
    enabled: false,
    retry: false,
  });
}
