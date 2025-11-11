import { CONFIG } from 'src/config-global';

import { CharColorView } from 'src/sections/charcolor/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Chinese Coloring - ${CONFIG.appName}`}</title>

      <CharColorView />
    </>
  );
}
