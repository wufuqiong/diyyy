import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import DrawIcon from '@mui/icons-material/Draw';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import GridOnIcon from '@mui/icons-material/GridOn';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExtensionIcon from '@mui/icons-material/Extension';

import { CONFIG } from 'src/config-global';
import { ink, shadow, radius, toolColors, candyColors } from 'src/theme/tokens';

// ----------------------------------------------------------------------
// Rainbow DIYYY logo text
// ----------------------------------------------------------------------

const rainbow = Object.values(candyColors);

function RainbowDiyyy() {
  const letters = ['D', 'I', 'Y', 'Y', 'Y'];
  return (
    <Box component="span" sx={{ display: 'inline', whiteSpace: 'nowrap' }}>
      {letters.map((letter, i) => (
        <Box
          component="span"
          key={i}
          sx={{ color: rainbow[i % rainbow.length] }}
        >
          {letter}
        </Box>
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// Candy tool card
// ----------------------------------------------------------------------

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  toolId: string;
}

function ToolCard({ title, description, icon, to, toolId }: ToolCardProps) {
  const { t } = useTranslation();
  const color = toolColors[toolId] || candyColors.blue;

  return (
    <Box
      sx={{
        borderRadius: radius.card,
        overflow: 'visible',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
        },
      }}
    >
      {/* Top segment — solid candy color */}
      <Box
        sx={{
          bgcolor: color,
          borderTopLeftRadius: radius.card,
          borderTopRightRadius: radius.card,
          pt: 2.5,
          pb: 6,
          px: 2,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blob */}
        <Box
          sx={{
            position: 'absolute',
            top: -14,
            right: -10,
            width: 70,
            height: 70,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.18)',
          }}
        />

        {/* Icon circle */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1,
            '& .MuiSvgIcon-root': { fontSize: 26, color },
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#fff',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Bottom segment — white card that overlaps top */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottomLeftRadius: radius.card,
          borderBottomRightRadius: radius.card,
          mt: '-24px',
          mx: 1.5,
          position: 'relative',
          zIndex: 1,
          px: 2.5,
          pt: 2,
          pb: 2.5,
          textAlign: 'center',
          boxShadow: shadow.cardRest,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Quicksand", "Noto Sans SC", sans-serif',
            fontWeight: 500,
            fontSize: '0.8rem',
            color: ink.soft,
            mb: 2,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>

        <Button
          component={RouterLink}
          to={to}
          fullWidth
          sx={{
            fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'none',
            bgcolor: color,
            color: '#fff',
            borderRadius: radius.button,
            py: 1,
            boxShadow: shadow.buttonRest,
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: color,
              filter: 'brightness(0.92)',
              boxShadow: shadow.buttonRest,
            },
            '&:active': {
              transform: 'translateY(3px)',
              boxShadow: shadow.buttonPressed,
            },
          }}
        >
          {t('dashboard.explore')}
        </Button>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Dashboard content
// ----------------------------------------------------------------------

function DashboardContent() {
  const { t } = useTranslation();

  const tools: ToolCardProps[] = [
    {
      title: t('nav.charcolor'),
      description: t('dashboard.features.charColorDesc'),
      icon: <ColorLensIcon />,
      to: '/charcolor',
      toolId: 'charcolor',
    },
    {
      title: t('nav.charmaze'),
      description: t('dashboard.features.charMazeDesc'),
      icon: <ExtensionIcon />,
      to: '/charmaze',
      toolId: 'charmaze',
    },
    {
      title: t('nav.chartrace'),
      description: t('dashboard.features.charTraceDesc'),
      icon: <DrawIcon />,
      to: '/chartrace',
      toolId: 'chartrace',
    },
    {
      title: t('nav.mathGenie'),
      description: t('dashboard.features.mathGenieDesc'),
      icon: <CalculateIcon />,
      to: '/math-genie',
      toolId: 'math-genie',
    },
    {
      title: t('nav.hundredChart'),
      description: t('dashboard.features.hundredChartDesc'),
      icon: <GridOnIcon />,
      to: '/hundred-chart',
      toolId: 'hundred-chart',
    },
    {
      title: t('nav.wordSearch'),
      description: t('dashboard.features.wordSearchDesc'),
      icon: <SearchIcon />,
      to: '/word-search',
      toolId: 'word-search',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Welcome */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
            color: ink.primary,
            mb: 0.5,
          }}
        >
          {t('dashboard.welcome')} <RainbowDiyyy />
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Quicksand", "Noto Sans SC", sans-serif',
            fontWeight: 500,
            fontSize: '0.95rem',
            color: ink.soft,
          }}
        >
          {t('dashboard.welcomeSub')}
        </Typography>
      </Box>

      {/* Tool cards */}
      <Grid container spacing={3}>
        {tools.map((tool) => (
          <Grid key={tool.toolId} size={{ xs: 12, sm: 6, md: 4 }}>
            <ToolCard {...tool} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>

      <DashboardContent />
    </>
  );
}
