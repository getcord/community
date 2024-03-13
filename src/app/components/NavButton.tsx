import cx from "classnames";
import styles from "./navButton.module.css";
import { DocumentTextIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

function NavIcon({
  iconFor,
  type,
}: {
  iconFor: string;
  type?: "resources" | "category";
}) {
  if (type === "resources") {
    switch (iconFor) {
      case "REST API Reference":
        return <CodeBracketIcon width={"14px"} />;
      case "Documentation":
        return <DocumentTextIcon width={"14px"} />;
      case "Cord Console":
        return <DocumentTextIcon width={"14px"} />;
    }
  }

  if (type === "category") {
    return (
      <span
        className={cx(styles.categoryPrefix, {
          [styles.red]: iconFor === "announcements",
          [styles.orange]: iconFor === "documentation",
          [styles.green]: iconFor === "API",
          [styles.orange]: iconFor === "customization",
        })}
      ></span>
    );
  }
}

export function NavButton({
  value,
  linkTo,
  isActive,
  type,
}: {
  value: string;
  linkTo: string;
  isActive: boolean;
  type?: "category" | "resources";
}) {
  return (
    <Link
      href={linkTo}
      className={cx(styles.button, {
        [styles.buttonActive]: isActive,
      })}
    >
      <NavIcon iconFor={value} type={type} />
      <span className={styles.buttonName}>{value}</span>
    </Link>
  );
}
