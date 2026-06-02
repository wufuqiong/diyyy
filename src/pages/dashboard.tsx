import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import DrawIcon from '@mui/icons-material/Draw';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import GridOnIcon from '@mui/icons-material/GridOn';
import CalculateIcon from '@mui/icons-material/Calculate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExtensionIcon from '@mui/icons-material/Extension';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Define types for FeatureCard props
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

// Custom card component for the features
function FeatureCard({ title, description, icon, to, color = 'primary' }: FeatureCardProps) {
  const { t } = useTranslation();
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3, pb: 1 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: `${color}.light`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ px: 3, pb: 3, mt: 'auto' }}>
        <Button
          component={RouterLink}
          to={to}
          variant="contained"
          color={color}
          fullWidth
        >
          {t('dashboard.explore')}
        </Button>
      </Box>
    </Card>
  );
}

// Main dashboard content component
function DashboardContent() {
  const { t } = useTranslation();

  const features: FeatureCardProps[] = [
    {
      title: t('nav.charcolor'),
      description: t('dashboard.features.charColorDesc'),
      icon: <ColorLensIcon sx={{ fontSize: 30, color: 'error.main' }} />,
      to: '/charcolor',
      color: 'error'
    },
    {
      title: t('nav.charmaze'),
      description: t('dashboard.features.charMazeDesc'),
      icon: <ExtensionIcon sx={{ fontSize: 30, color: 'warning.main' }} />,
      to: '/charmaze',
      color: 'warning'
    },
    {
      title: t('nav.chartrace'),
      description: t('dashboard.features.charTraceDesc'),
      icon: <DrawIcon sx={{ fontSize: 30, color: 'success.main' }} />,
      to: '/chartrace',
      color: 'success'
    },
    {
      title: t('nav.mathGenie'),
      description: t('dashboard.features.mathGenieDesc'),
      icon: <CalculateIcon sx={{ fontSize: 30, color: 'info.main' }} />,
      to: '/math-genie',
      color: 'info'
    },
    {
      title: t('nav.hundredChart'),
      description: t('dashboard.features.hundredChartDesc'),
      icon: <GridOnIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      to: '/hundred-chart',
      color: 'primary'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {t('dashboard.welcome')}
        </Typography>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <FeatureCard {...feature} />
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
      <meta
        name="description"
        content="The starting point for your next project with DIYYY Kit, built on the newest version of Material-UI ©, ready to be customized to your style"
      />
      <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />

      <DashboardContent />
    </>
  );
}