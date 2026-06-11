import { apiEndpoints } from "@/config/api";

interface EndpointService<TEndpoints> {
  readonly endpoints: TEndpoints;
}

function createEndpointService<TEndpoints>(
  endpoints: TEndpoints
): EndpointService<TEndpoints> {
  return { endpoints };
}

export const authBackendService = createEndpointService(apiEndpoints.auth);
export const userBackendService = createEndpointService(apiEndpoints.users);
export const roleBackendService = createEndpointService(apiEndpoints.roles);
export const groupBackendService = createEndpointService(apiEndpoints.groups);
export const scheduleBackendService = createEndpointService(
  apiEndpoints.schedules
);
export const caseBackendService = createEndpointService(apiEndpoints.cases);
export const simulationBackendService = createEndpointService(
  apiEndpoints.simulations
);
