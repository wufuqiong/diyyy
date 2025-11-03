import { CONFIG } from 'src/config-global';

import { CNColorView } from 'src/sections/cncolor/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>

      <CNColorView />
    </>
  );
}
