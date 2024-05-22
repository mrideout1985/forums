import { getServerAuthSession } from "@/server/auth";
import { UserMenu } from "../../_components/usermenu/userMenu";
import styles from "./topbar.module.scss";
import Logo from "../../_components/logo/logo";

const TopBar = async () => {
  const session = await getServerAuthSession();

  return (
    <header className={styles.topbar}>
      <Logo text="forums" size={25} />
      <UserMenu session={session} />
    </header>
  );
};

export { TopBar };
