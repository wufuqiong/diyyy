import { CONFIG } from 'src/config-global';

import { MathGenieView } from 'src/sections/math-genie/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Math Genie - ${CONFIG.appName}`}</title>

      <MathGenieView />
    </>
  );
}
