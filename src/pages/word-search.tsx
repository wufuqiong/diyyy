import { CONFIG } from 'src/config-global';

import { WordSearchView } from 'src/sections/word-search/view';

export default function Page() {
  return (
    <>
      <title>{`Word Search - ${CONFIG.appName}`}</title>
      <WordSearchView />
    </>
  );
}
