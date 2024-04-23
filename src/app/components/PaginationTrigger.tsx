import * as React from 'react';
import type { PaginationParams } from '@cord-sdk/types';
import useIsVisible from '@/app/hooks/useIsVisible';
import { useCallback, useEffect, useRef } from 'react';

const NUM_TO_LOAD = 20;

type Props = PaginationParams;

export function PaginationTrigger({ loading, hasMore, fetchMore }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(ref);

  const doFetch = useCallback(() => {
    void fetchMore(NUM_TO_LOAD);
  }, [fetchMore]);

  useEffect(() => {
    if (isVisible && !loading && hasMore) {
      doFetch();
    }
  }, [doFetch, hasMore, isVisible, loading]);

  return <div ref={ref} />;
}
