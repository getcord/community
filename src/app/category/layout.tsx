import Sidebar from "@/app/components/Sidebar";
import styles from "@/app/styles.module.css";
import Header from "@/app/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboard}>
      <Header />
      <Sidebar />
      {children}
    </div>
  );
}
