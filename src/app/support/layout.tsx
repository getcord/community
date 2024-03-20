import Support from './Support';
import styles from './support.module.css';


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div  className={styles.container}>
      <Support />
      <div>{children}</div>
    </div>
  );
}
