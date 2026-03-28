import DrawIcon from '@mui/icons-material/Draw';
import CalculateIcon from '@mui/icons-material/Calculate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExtensionIcon from '@mui/icons-material/Extension';

import { SvgColor } from 'src/components/svg-color';


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
    icon: <ColorLensIcon />,
  },
  {
    title: '识字迷宫',
    path: '/charmaze',
    icon: <ExtensionIcon />,
  },
  {
    title: '描红写字',
    path: '/chartrace',
    icon: <DrawIcon />,
  },
  {
    title: '算术天地',
    path: '/math-genie',
    icon: <CalculateIcon />,
  }
];
