import type { DefaultOptions } from "@tanstack/react-query";

export const queryClientDefaultOptions: DefaultOptions = {
  queries: {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
};
