import styles from './datedivider.module.css';

export default function DateDivider({ timestamp }: { timestamp: Date }) {
  const now = new Date();
  const isToday =
    now.getFullYear() === timestamp.getFullYear() &&
    now.getMonth() === timestamp.getMonth() &&
    now.getDate() === timestamp.getDate();

  return (
    <section className={styles.container}>
      <div className={styles.line} />
      <div className={styles.pill}>
        {isToday
          ? 'Today'
          : timestamp.toLocaleDateString('en', {
              weekday: 'short',
              month: 'long',
              day: 'numeric',
            })}
      </div>
    </section>
  );
}
