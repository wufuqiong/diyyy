import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { candyColors } from 'src/theme/tokens';
import { TitleSlotMount, ToolbarSlotMount } from 'src/shared/worksheet/ToolbarSlot';

import { LanguageSwitcher } from 'src/components/language-switcher/LanguageSwitcher';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { dashboardLayoutVars } from './css-vars';
import { MainSection } from '../core/main-section';
import { useNavData } from '../nav-config-dashboard';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const navData = useNavData();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const renderSidebarTopArea = () => (
    <Box sx={{ px: 2.5, py: 3, display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}assets/images/diyyy.png`}
        sx={{
          width: 44,
          height: 44,
          borderRadius: '16px',
          bgcolor: candyColors.orange,
          p: 0.5,
        }}
      />
      <Typography
        sx={{
          fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
          fontWeight: 700,
          fontSize: '1.4rem',
          color: candyColors.orange,
        }}
      >
        DIYYY
      </Typography>
    </Box>
  );

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            slots={{ topArea: renderSidebarTopArea() }}
          />
          <TitleSlotMount />
        </>
      ),
      rightArea: (
        <>
          <ToolbarSlotMount />
          <LanguageSwitcher />
        </>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        disableOffset
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={[
          {
            backgroundColor: '#fff',
            borderBottom: '1px solid rgba(58,53,80,0.06)',
          },
          ...(Array.isArray(slotProps?.header?.sx) ? slotProps.header.sx : slotProps?.header?.sx ? [slotProps.header.sx] : []),
        ]}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop
          data={navData}
          layoutQuery={layoutQuery}
          slots={{
            topArea: renderSidebarTopArea(),
          }}
        />
      }
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
