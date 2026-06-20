import { useTranslation } from 'react-i18next';

import DrawIcon from '@mui/icons-material/Draw';
import GridOnIcon from '@mui/icons-material/GridOn';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExtensionIcon from '@mui/icons-material/Extension';

import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => <SvgColor src={`${import.meta.env.BASE_URL}assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export function useNavData(): NavItem[] {
  const { t } = useTranslation();

  return [
    {
      title: t('nav.dashboard'),
      path: '/',
      icon: icon('ic-analytics'),
    },
    {
      title: t('nav.charcolor'),
      path: '/charcolor',
      icon: <ColorLensIcon />,
    },
    {
      title: t('nav.charmaze'),
      path: '/charmaze',
      icon: <ExtensionIcon />,
    },
    {
      title: t('nav.chartrace'),
      path: '/chartrace',
      icon: <DrawIcon />,
    },
    {
      title: t('nav.mathGenie'),
      path: '/math-genie',
      icon: <CalculateIcon />,
    },
    {
      title: t('nav.hundredChart'),
      path: '/hundred-chart',
      icon: <GridOnIcon />,
    },
    {
      title: t('nav.wordSearch'),
      path: '/word-search',
      icon: <SearchIcon />,
    },
  ];
}
