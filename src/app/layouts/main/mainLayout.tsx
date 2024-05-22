import { ReactNode } from "react";
import styles from "./mainLayout.module.scss";
import { TopBar } from "@/app/containers/topbar/topbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  console.log("HELLO");

  return (
    <div className={styles.container}>
      <TopBar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
