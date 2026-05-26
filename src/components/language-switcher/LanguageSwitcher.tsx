import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (_: React.MouseEvent<HTMLElement>, lang: string | null) => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  };

  return (
    <Box sx={{ px: 2.5, py: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        Language / 语言
      </Typography>
      <ToggleButtonGroup
        value={i18n.language?.startsWith('en') ? 'en' : 'zh-CN'}
        exclusive
        fullWidth
        size="small"
        onChange={handleChange}
      >
        <ToggleButton value="zh-CN">中文</ToggleButton>
        <ToggleButton value="en">EN</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
