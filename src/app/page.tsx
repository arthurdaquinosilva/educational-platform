import { DEFAULT_LOCALE } from '@/lib/i18n';
import { site } from '@/config/site';

/**
 * The locale is always in the path, so `/` holds no content of its own — it
 * only forwards to the default locale. A static export cannot issue a 3xx, so
 * this is a meta refresh (React hoists these tags into <head>) plus a canonical
 * link pointing crawlers at the real page.
 */
const target = `${site.basePath}/${DEFAULT_LOCALE}/`;

export default function RootPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <link rel="canonical" href={target} />
      <a href={target}>Ir para o site</a>
    </>
  );
}
