import { AdminChrome } from "@/components/admin/admin-chrome";
import { SetupNotice } from "@/components/setup-notice";
import { getAdminContext } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getAdminContext(2, "/admin");

  if (!context.configured) {
    return (
      <div className="space-y-4">
        <SetupNotice reason={context.reason} />
      </div>
    );
  }

  if (context.forbidden) {
    return (
      <div className="space-y-4">
        <SetupNotice reason="Seu perfil existe, mas ainda nao possui nivel 2 ou superior para editar o arquivo." />
      </div>
    );
  }

  if (context.authMethod === "supabase") {
    return (
      <AdminChrome accessLabel={`Nivel ${context.profile?.access_level ?? 1} - ${context.profile?.role ?? "viewer"}`}>
        {children}
      </AdminChrome>
    );
  }

  return <AdminChrome accessLabel="PIN admin">{children}</AdminChrome>;
}
