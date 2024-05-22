import { ReactNode } from "react";
import styles from "./appLayout.module.scss";
import { TopBar } from "@/app/containers/topbar/topbar";
import { getServerAuthSession } from "@/server/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerAuthSession();

  return (
    <div className={styles.container}>
      <TopBar />
      <main className={styles.content}>
        {session ? (
          children
        ) : (
          <div style={{ height: "100vh", width: "100%", background: "green" }}>
            Fucking Login
          </div>
        )}
      </main>
    </div>
  );
}
