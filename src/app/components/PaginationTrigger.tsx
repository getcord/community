import * as React from 'react';
import type { PaginationParams } from '@cord-sdk/types';
import styles from './paginationtrigger.module.css';
import useIsVisible from '@/app/hooks/useIsVisible';

const NUM_TO_LOAD = 20;

type Props = PaginationParams;

export function PaginationTrigger({ loading, hasMore, fetchMore }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(ref);

  const doFetch = React.useCallback(() => {
    void fetchMore(NUM_TO_LOAD);
  }, [fetchMore]);

  React.useEffect(() => {
    if (isVisible && !loading && hasMore) {
      doFetch();
    }
  }, [doFetch, hasMore, isVisible, loading]);

  const content = loading
    ? 'Loading more messages...'
    : hasMore
    ? 'More messages available'
    : null;

  return (
    <div onClick={doFetch} ref={ref}>
      {content ? <p className={styles.triggerText}>{content}</p> : null}
    </div>
  );
}
