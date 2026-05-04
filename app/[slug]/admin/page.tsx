"use client";
import { useParams, useRouter } from "next/navigation";
import { useDashboardConfig, useToggleIntegration, useLogout } from "@/hooks";

// ─── Widget components ─────────────────────────────────────────────────────────
type WP = { widget: any; data: any };

function StatCard({ widget, data }: WP) {
  const value = data.stats?.[widget.dataKey] ?? "—";
  return (
    <div data-testid="widget-stat-card" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{widget.label}</p>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function IntegrationStatus({ widget, data }: WP) {
  const { slug } = useParams() as { slug: string };
  const toggle = useToggleIntegration(slug);
  const enabled: boolean = data.integrations?.[widget.integrationKey] ?? false;
  return (
    <div data-testid="widget-integration-status" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">{widget.label}</p>
        <p className={`text-sm mt-1 font-medium ${enabled ? "text-green-600" : "text-gray-400"}`}>{enabled ? "● Active" : "○ Inactive"}</p>
      </div>
      <button
        onClick={() => toggle.mutate({ integration: widget.integrationKey, enabled: !enabled })}
        disabled={toggle.isPending}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? "bg-indigo-600" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function RecentConversations({ widget, data }: WP) {
  return (
    <div data-testid="widget-recent-conversations" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm col-span-full">
      <p className="font-semibold text-gray-800 mb-4">{widget.label}</p>
      {data.recentConvos?.length === 0 ? (
        <p className="text-sm text-gray-400">No conversations yet.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {data.recentConvos?.map((c: any) => (
            <div key={c._id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{c.title}</p>
                <p className="text-xs text-gray-400">{c.userId?.name ?? "Unknown"}</p>
              </div>
              <p className="text-xs text-gray-400">{new Date(c.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserList({ widget, data }: WP) {
  return (
    <div data-testid="widget-user-list" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <p className="font-semibold text-gray-800 mb-4">{widget.label}</p>
      <div className="space-y-3">
        {data.users?.map((u: any) => (
          <div key={u._id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">{u.name[0]}</div>
            <div>
              <p className="text-sm font-medium text-gray-700">{u.name}</p>
              <p className="text-xs text-gray-400">{u.email} · <span className={u.role === "admin" ? "text-indigo-600" : ""}>{u.role}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const WIDGET_MAP: Record<string, React.FC<WP>> = {
  "stat-card": StatCard,
  "integration-status": IntegrationStatus,
  "recent-conversations": RecentConversations,
  "user-list": UserList,
};

// ─── Admin Dashboard Page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const logout = useLogout();
  const { data, isLoading, isError, error } = useDashboardConfig(slug);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-semibold text-lg">{(error as Error).message}</p>
        <button onClick={() => router.push(`/${slug}/chat`)} className="text-indigo-600 text-sm hover:underline">← Back to chat</button>
      </div>
    );
  }

  const { config, stats, recentConvos, users, integrations } = data!;
  const widgetData = { stats, recentConvos, users, integrations };

  const sections = [...(config?.sections ?? [])].sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Layout driven by MongoDB · <code className="bg-gray-100 px-1.5 py-0.5 rounded">dashboardconfigs → {slug}</code></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/${slug}/chat`)} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">← Chat</button>
          <button onClick={async () => { await logout.mutateAsync(); router.push("/login"); }} className="text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Log out</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {sections.map((section: any) => {
          const widgets = [...section.widgets].sort((a: any, b: any) => a.order - b.order);
          return (
            <div key={section.id} className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{section.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((widget: any, i: number) => {
                  const Component = WIDGET_MAP[widget.type];
                  if (!Component) return (
                    <div key={i} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-sm text-gray-400">
                      Unknown widget type: <code className="bg-gray-100 px-1 rounded">{widget.type}</code>
                    </div>
                  );
                  return <Component key={i} widget={widget} data={widgetData} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
