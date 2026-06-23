import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { ink, candyColors } from 'src/theme/tokens';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'zh-CN';

  const handleChange = (_: React.MouseEvent<HTMLElement>, lang: string | null) => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  };

  return (
    <Box sx={{ px: 2.5, py: 1.5 }}>
      <Typography
        sx={{ fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif', fontSize: 11, color: ink.soft, mb: 0.75 }}
      >
        Language / 语言
      </Typography>
      <ToggleButtonGroup
        value={currentLang}
        exclusive
        fullWidth
        size="small"
        onChange={handleChange}
        sx={{
          borderRadius: '999px',
          overflow: 'hidden',
          '& .MuiToggleButton-root': {
            fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
            fontWeight: 700,
            fontSize: 13,
            borderRadius: '999px !important',
            border: '2px solid transparent',
            color: ink.soft,
            textTransform: 'none',
            py: 0.75,
            transition: 'all 0.2s',
            '&.Mui-selected': {
              bgcolor: candyColors.blue,
              color: '#fff',
              borderColor: candyColors.blue,
            },
            '&:not(.Mui-selected):hover': {
              bgcolor: 'rgba(77,157,224,0.08)',
            },
          },
        }}
      >
        <ToggleButton value="zh-CN">中文</ToggleButton>
        <ToggleButton value="en">EN</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
