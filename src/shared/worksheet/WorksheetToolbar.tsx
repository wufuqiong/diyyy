import React from 'react';
import { useTranslation } from 'react-i18next';

import { Stack, Tooltip, IconButton } from '@mui/material';
import { Print as PrintIcon, HelpOutline as HelpIcon, PictureAsPdf as PdfIcon, RestartAlt as ResetIcon } from '@mui/icons-material';

interface WorksheetToolbarProps {
  onPrint: () => void;
  onSavePdf: () => void;
  onReset?: () => void;
  onHelp?: () => void;
  isSaving?: boolean;
}

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
          <IconButton onClick={onReset} size="small" color="inherit">
            <ResetIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={isSaving ? t('common.savingPdf') : t('common.savePdf')} arrow>
        <span>
          <IconButton onClick={onSavePdf} disabled={isSaving} size="small" color="primary">
            <PdfIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('common.print')} arrow>
        <IconButton onClick={onPrint} size="small" color="primary">
          <PrintIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {onHelp && (
        <Tooltip title={t('common.help')} arrow>
          <IconButton onClick={onHelp} size="small" color="inherit">
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};
