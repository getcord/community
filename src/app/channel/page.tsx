import Conduct from "./[channel]/Conduct";
import styles from './styles.module.css';

export default function Content() {
  return <div className={styles.container}>
    {/* will be dynamic for which channel it is -> need to think this through, will there be a map? 🤔 */}
    <Conduct />
  </div>
};