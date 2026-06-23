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
  /** Tool ID for per-tool candy color — absent for non-tool items (dashboard) */
  toolId?: string;
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
      toolId: 'charcolor',
    },
    {
      title: t('nav.charmaze'),
      path: '/charmaze',
      icon: <ExtensionIcon />,
      toolId: 'charmaze',
    },
    {
      title: t('nav.chartrace'),
      path: '/chartrace',
      icon: <DrawIcon />,
      toolId: 'chartrace',
    },
    {
      title: t('nav.mathGenie'),
      path: '/math-genie',
      icon: <CalculateIcon />,
      toolId: 'math-genie',
    },
    {
      title: t('nav.hundredChart'),
      path: '/hundred-chart',
      icon: <GridOnIcon />,
      toolId: 'hundred-chart',
    },
    {
      title: t('nav.wordSearch'),
      path: '/word-search',
      icon: <SearchIcon />,
      toolId: 'word-search',
    },
  ];
}
