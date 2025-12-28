import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ExploreIcon from '@mui/icons-material/Explore';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DashboardIcon from '@mui/icons-material/Dashboard';

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
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button 
          component={RouterLink} 
          to={to} 
          variant="contained" 
          color={color}
          fullWidth
        >
          Explore
        </Button>
      </CardContent>
    </Card>
  );
}

// Main dashboard content component
function DashboardContent() {
  const features: FeatureCardProps[] = [
    {
      title: 'Char Color',
      description: 'Explore and customize character colors with our intuitive color palette tool. Create beautiful color schemes for your characters.',
      icon: <ColorLensIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      to: '/charcolor',
      color: 'primary'
    },
    {
      title: 'Char Maze',
      description: 'Navigate through challenging mazes with your character. Test your skills in this exciting maze adventure game.',
      icon: <ExploreIcon sx={{ fontSize: 30, color: 'secondary.main' }} />,
      to: '/charmaze',
      color: 'secondary'
    },
    {
      title: 'Char Trace',
      description: 'Practice writing characters by tracing them. Improve your handwriting skills with our interactive tracing tool.',
      icon: <ExploreIcon sx={{ fontSize: 30, color: 'secondary.main' }} />,
      to: '/chartrace',
      color: 'secondary'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to {CONFIG.appName}
        </Typography>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid key={index} size={{ xs:12, md:4 }}>
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