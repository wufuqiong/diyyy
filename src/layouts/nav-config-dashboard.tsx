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
    icon: icon('ic-coloring'),
  },
  {
    title: '识字迷宫',
    path: '/charmaze',
    icon: icon('ic-maze'),
  },
  {
    title: '描红写字',
    path: '/chartrace',
    icon: icon('ic-write'),
  },
  {
    title: '算术天地',
    path: '/math-genie',
    icon: icon('ic-math'),
  }
];
