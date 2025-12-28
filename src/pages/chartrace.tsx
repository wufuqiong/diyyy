import { CONFIG } from 'src/config-global';

import { CharTraceView } from 'src/sections/chartrace/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Char Trace - ${CONFIG.appName}`}</title>

      <CharTraceView />
    </>
  );
}
