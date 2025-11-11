import { CONFIG } from 'src/config-global';

import { CharMazeView } from 'src/sections/charmaze/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Chinese Maze - ${CONFIG.appName}`}</title>

      <CharMazeView />
    </>
  );
}
