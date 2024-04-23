import { useState, useLayoutEffect, RefObject } from 'react';

export default function useIsVisible(elementRef: RefObject<HTMLDivElement>) {
  const [isElementVisible, setIsElementVisible] = useState(false);

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsElementVisible(entry.isIntersecting);
    });

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [elementRef]);

  return isElementVisible;
}
