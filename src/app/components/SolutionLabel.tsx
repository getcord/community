import cx from 'classnames';
import styles from './solutionLabel.module.css';

type SolutionLabelProps = {
  className?: string;
};
export function SolutionLabel({ className }: SolutionLabelProps) {
  return (
    <span className={cx(styles.solutionLabel, styles.solutionTag, className)}>
      Solution
    </span>
  );
}
