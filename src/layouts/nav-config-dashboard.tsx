import { useTranslation } from 'react-i18next';

import MapIcon from '@mui/icons-material/Map';
import GridOnIcon from '@mui/icons-material/GridOn';
import SearchIcon from '@mui/icons-material/Search';
import PaletteIcon from '@mui/icons-material/Palette';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CalculateIcon from '@mui/icons-material/Calculate';

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
      icon: <PaletteIcon />,
      toolId: 'charcolor',
    },
    {
      title: t('nav.charmaze'),
      path: '/charmaze',
      icon: <MapIcon />,
      toolId: 'charmaze',
    },
    {
      title: t('nav.chartrace'),
      path: '/chartrace',
      icon: <EditNoteIcon />,
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
