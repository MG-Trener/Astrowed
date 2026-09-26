import { LoginForm } from "@/components/login-form";
import { workspaceConfigured, isAuthenticated } from "@/services/auth";
import { redirect } from "next/navigation";
export const metadata = { title: "Кабинет консультанта" };
export const dynamic = "force-dynamic";
export default async function Page() {
  if (await isAuthenticated()) redirect("/clients");
  return (
    <div className="page-wrap">
      <div className="login">
        <div className="eyebrow">PRIVATE WORKSPACE</div>
        <h1>Ваше пространство работы.</h1>
        <p>
          Клиенты, карты и заметки консультаций доступны только после входа.
        </p>
        <LoginForm configured={workspaceConfigured()} />
      </div>
    </div>
  );
}
