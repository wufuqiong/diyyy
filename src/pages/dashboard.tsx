import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { ink, candyColors } from 'src/theme/tokens';

import { TemplateGallery } from 'src/sections/dashboard/TemplateGallery';

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
// Dashboard content
// ----------------------------------------------------------------------

function DashboardContent() {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 4 }}>
      {/* Welcome */}
      <Container maxWidth="md">
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
      </Container>

      {/* Template Gallery — per-tool rows with horizontal scroll */}
      <TemplateGallery />
    </Box>
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
