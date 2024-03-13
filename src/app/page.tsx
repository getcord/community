import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Content from "./category/page";
import styles from "./styles.module.css";

export default function App() {
  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <Header />
      <Content />
    </div>
  );
}
