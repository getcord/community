import styles from "./threadheader.module.css";
import cx from "classnames";

export default async function ThreadHeader({
  permissions,
}: {
  permissions: string;
}) {
  return (
    <div className={cx(styles.container)}>
      <div className={styles.filters}>
        {/* 
         TODO: fetch all tags and put them in a dropdown menu button
         */}
        FILTERS WOULD APPEAR HERE
      </div>

      {permissions !== "NOT_VISIBLE" && (
        <button
          className={styles.actionButton}
          disabled={permissions === "READ"}
        >
          + Start a discussion
        </button>
      )}
    </div>
  );
}
