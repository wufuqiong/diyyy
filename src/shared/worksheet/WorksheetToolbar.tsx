import React from 'react';
import { useTranslation } from 'react-i18next';

import { Stack, Tooltip, IconButton } from '@mui/material';
import { Print as PrintIcon, HelpOutline as HelpIcon, PictureAsPdf as PdfIcon, RestartAlt as ResetIcon } from '@mui/icons-material';

import { candyColors } from 'src/theme/tokens';

interface WorksheetToolbarProps {
  onPrint: () => void;
  onSavePdf: () => void;
  onReset?: () => void;
  onHelp?: () => void;
  isSaving?: boolean;
}

const iconBtnSx = {
  width: 36,
  height: 36,
  borderRadius: '12px',
  transition: 'all 0.2s',
};

const activeSx = (bg: string) => ({
  ...iconBtnSx,
  bgcolor: `${bg}14`,
  color: bg,
  '&:hover': { bgcolor: `${bg}22` },
});

export const WorksheetToolbar: React.FC<WorksheetToolbarProps> = ({
  onPrint,
  onSavePdf,
  onReset,
  onHelp,
  isSaving = false,
}) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {onReset && (
        <Tooltip title={t('common.reset')} arrow>
          <IconButton onClick={onReset} size="small" sx={iconBtnSx}>
            <ResetIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={isSaving ? t('common.savingPdf') : t('common.savePdf')} arrow>
        <span>
          <IconButton onClick={onSavePdf} disabled={isSaving} size="small" sx={activeSx(candyColors.red)} data-testid="toolbar-save-pdf">
            <PdfIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('common.print')} arrow>
        <IconButton onClick={onPrint} size="small" sx={activeSx(candyColors.green)}>
          <PrintIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {onHelp && (
        <Tooltip title={t('common.help')} arrow>
          <IconButton onClick={onHelp} size="small" sx={activeSx(candyColors.blue)}>
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};
