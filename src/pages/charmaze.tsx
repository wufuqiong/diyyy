import { CONFIG } from 'src/config-global';

import { CharMazeView } from 'src/sections/charmaze/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Char Maze - ${CONFIG.appName}`}</title>

      <CharMazeView />
    </>
  );
}
