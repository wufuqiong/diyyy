import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: '识字涂色',
    path: '/charcolor',
    icon: <img src="/assets/icons/coloring.png" alt="cloring icon" style={{ width: '24px', height: '24px' }} />,
  },
  {
    title: '识字迷宫',
    path: '/charmaze',
    icon: <img src="/assets/icons/maze.png" alt="maze icon" style={{ width: '24px', height: '24px' }} />,
  },
];
