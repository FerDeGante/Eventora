import { useQuery } from "@tanstack/react-query";

export interface AdminStats {
  activeMembers: number;
  packagesSoldThisMonth: number;
  reservationsThisMonth: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export function useAdminStats() {
  return useQuery<AdminStats, Error>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || `Error ${res.status}`);
      }
      return (await res.json()) as AdminStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
