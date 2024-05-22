import { getServerAuthSession } from "@/server/auth";
import MainLayout from "./layouts/main/mainLayout";

export default async function Home() {
  return <MainLayout>APP</MainLayout>;
}
