import { CONFIG } from 'src/config-global';

import { CNMazeView } from 'src/sections/cnmaze/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Chinese Maze - ${CONFIG.appName}`}</title>

      <CNMazeView />
    </>
  );
}
