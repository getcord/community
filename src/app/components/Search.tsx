import type { ChangeEvent, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import styles from './search.module.css';
import cx from 'classnames';
import Link from 'next/link';
import Divider from '@/app/ui/Divider';
import { SingleResultData } from '@/app/api/search/parseSearchResults';
import CategoryPill from '@/app/components/CategoryPill';

function SingleSearchResultDisplay({
  url,
  title,
  categories,
  content,
}: SingleResultData) {
  if (!title || !content) {
    return;
  }
  return (
    <li className={styles.resultsListItem}>
      <Link href={url} className={styles.resultCard}>
        <span className={styles.resultTitle}>{title}</span>
        {categories && (
          <span className={styles.categories}>
            {categories.map((cat) => (
              <CategoryPill key={cat} category={cat} />
            ))}
          </span>
        )}
        <span className={styles.resultDescription}>{content}</span>
      </Link>
    </li>
  );
}

type SearchResultsDisplayProps = {
  results: SingleResultData[];
  index: string;
};
function SearchResultsDisplay({ results, index }: SearchResultsDisplayProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const displayOrigin = index === 'community' ? 'Community' : 'Docs';

  return (
    <div className={styles.resultsIndexContainer}>
      {results.length > 0 ? (
        <>
          <div
            className={styles.resultsOrigin}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronDownIcon width={14} />
            ) : (
              <ChevronUpIcon width={14} />
            )}
            <span>
              {collapsed ? 'Show' : 'Hide'} results from {displayOrigin}
            </span>
          </div>
          {!collapsed && (
            <>
              <ol className={styles.resultsList}>
                {results.map((data: SingleResultData, i) => {
                  return <SingleSearchResultDisplay key={i} {...data} />;
                })}
              </ol>
              <Divider />
            </>
          )}
        </>
      ) : (
        <span className={styles.noResultsMessage}>
          No results found from {displayOrigin}
        </span>
      )}
    </div>
  );
}

export default function SearchBox({
  fullPage,
  className,
}: {
  fullPage?: boolean;
  className?: string;
}) {
  const [searchValue, setSearchValue] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [results, setResults] = useState<SearchResultsDisplayProps[]>([]);

  const search = useCallback(async (searchTerm: string) => {
    const res = await fetch(
      `/api/search?searchTerm=${encodeURIComponent(searchTerm)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await res.json();
    setResults(data);
  }, []);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchValue(val);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        if (val !== '') {
          search(val);
        }
      }, 300);
    },
    [setSearchValue, search],
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        search(searchValue);
      }
    },
    [search, searchValue],
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const closeSearch = useCallback(() => {
    setResults([]);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [setResults]);

  useEffect(() => {
    if (!results.length) {
      return;
    }

    const onKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    };
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [results, closeSearch, fullPage]);

  return (
    <div
      className={cx(
        styles.container,
        { [styles.inFullPageDisplay]: fullPage },
        className,
      )}
    >
      {results.length > 0 && !fullPage && (
        <div className={styles.overlay} onClick={closeSearch} />
      )}

      <div className={styles.searchContainer}>
        <div
          className={cx(styles.inputContainer, {
            [styles.resultsDisplayed]: results.length > 0,
          })}
        >
          <MagnifyingGlassIcon
            width={16}
            height={16}
            className={styles.inputIcon}
          />
          <input
            ref={inputRef}
            tabIndex={1}
            type="text"
            value={searchValue}
            onChange={onChange}
            onKeyUp={onKeyUp}
            placeholder="Search"
            className={styles.input}
            autoFocus={fullPage ? true : false}
          />
        </div>

        {results.length > 0 && (
          <div className={styles.searchResults}>
            {results.map((res: SearchResultsDisplayProps, i) => {
              return (
                <SearchResultsDisplay
                  key={i}
                  results={res.results}
                  index={res.index}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
