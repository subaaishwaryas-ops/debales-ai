import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAllUsers() {
  return useQuery({ queryKey: ["users"], queryFn: async () => { const r = await fetch("/api/auth/users"); if (!r.ok) throw new Error("Failed"); return r.json(); } });
}

export function useLogin() {
  return useMutation({ mutationFn: async (userId: string) => { const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) }); if (!r.ok) throw new Error("Login failed"); return r.json(); } });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async () => { await fetch("/api/auth/login", { method: "DELETE" }); }, onSuccess: () => qc.clear() });
}

export function useProject(slug: string) {
  return useQuery({ queryKey: ["project", slug], queryFn: async () => { const r = await fetch(`/api/projects/${slug}`); if (!r.ok) throw new Error("Failed"); return r.json(); }, enabled: !!slug });
}

export function useConversations(slug: string) {
  return useQuery({ queryKey: ["conversations", slug], queryFn: async () => { const r = await fetch(`/api/projects/${slug}/conversations`); if (!r.ok) throw new Error("Failed"); return r.json(); }, enabled: !!slug });
}

export function useCreateConversation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productInstanceId: string; title?: string }) => { const r = await fetch(`/api/projects/${slug}/conversations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations", slug] }),
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({ queryKey: ["messages", conversationId], queryFn: async () => { const r = await fetch(`/api/conversations/${conversationId}/messages`); if (!r.ok) throw new Error("Failed"); return r.json(); }, enabled: !!conversationId });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => { const r = await fetch(`/api/conversations/${conversationId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, content }) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }),
  });
}

export function useDashboardConfig(slug: string) {
  return useQuery({
    queryKey: ["dashboard-config", slug],
    queryFn: async () => {
      const r = await fetch(`/api/projects/${slug}/dashboard-config`);
      if (r.status === 403) throw new Error("Admin access required");
      if (!r.ok) throw new Error("Failed");
      return r.json() as Promise<{ config: any; stats: { totalConversations: number; totalMessages: number; activeUsers: number }; recentConvos: any[]; users: any[]; integrations: { shopify: boolean; crm: boolean } }>;
    },
    enabled: !!slug,
  });
}

export function useToggleIntegration(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { integration: "shopify" | "crm"; enabled: boolean }) => { const r = await fetch(`/api/projects/${slug}/integrations`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-config", slug] }); qc.invalidateQueries({ queryKey: ["project", slug] }); },
  });
}
