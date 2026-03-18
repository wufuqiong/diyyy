import { CONFIG } from 'src/config-global';

import { NumberCompositionView } from 'src/sections/number-composition/view/number-composition-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`数的分合 - ${CONFIG.appName}`}</title>

      <NumberCompositionView />
    </>
  );
}
