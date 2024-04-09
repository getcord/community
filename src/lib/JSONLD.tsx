import Script from 'next/script';
import { Thing, WithContext } from 'schema-dts';

export function JSONLD<T extends Thing>({ json }: { json: WithContext<T> }) {
  return (
    <Script
      id="ld-json"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
