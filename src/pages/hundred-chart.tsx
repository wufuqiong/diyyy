import { CONFIG } from 'src/config-global';

import { HundredChartView } from 'src/sections/hundred-chart/view';

export default function Page() {
  return (
    <>
      <title>{`百数板 - ${CONFIG.appName}`}</title>
      <HundredChartView />
    </>
  );
}
