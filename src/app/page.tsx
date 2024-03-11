import ChannelList from "./components/ChannelList";
import Header from "./components/Header";
import Content from "./channel/page";
import styles from './styles.module.css';

export default function App() {
  return <div className={styles.dashboard}>
    <ChannelList />
    <Header />
    <Content />
  </div>
}