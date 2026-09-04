import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getVerificationState } from "@/features/auth/lib/verification.functions";

/**
 * Verification state of the signed-in merchant. Live payment features stay
 * disabled until KYB/KYC is approved.
 */
export function useVerification() {
  const fetchState = useServerFn(getVerificationState);
  const query = useQuery({
    queryKey: ["verification"],
    queryFn: () => fetchState({ data: undefined as never }),
    staleTime: 30_000,
  });
  return {
    ...query,
    state: query.data ?? null,
    featuresEnabled: query.data?.featuresEnabled ?? false,
  };
}
