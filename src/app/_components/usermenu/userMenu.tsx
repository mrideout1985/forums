import { Session } from "next-auth";
import Link from "next/link";
import styles from "./userMenu.module.scss";

export interface UserMenuProps {
  session: Session | null;
}

const UserMenu = ({ session }: UserMenuProps) => {
  console.log(session);
  return (
    <div className={styles.container}>
      <div>{session?.user.name}</div>
      <Link
        className={styles.authLink}
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
      >
        {session ? "Sign out" : "Sign in"}
      </Link>
    </div>
  );
};

export { UserMenu };
