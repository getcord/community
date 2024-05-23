import type { ChangeEvent, KeyboardEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import styles from './search.module.css';
import cx from 'classnames';

export default function Search() {
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

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
    console.log({ data });
    setResults(data);
  }, []);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchValue(val);
      setResults([]);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        if (val !== '') {
          search(val);
        }
      }, 300);
    },
    [setSearchValue, setResults, search],
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

  return (
    <div className={styles.searchContainer}>
      <div className={styles.inputContainer}>
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
          autoFocus={false}
          className={styles.input}
        />
      </div>
    </div>
  );
}
