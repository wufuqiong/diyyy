import React, { useState, useCallback } from 'react';

import { Print, PictureAsPdf } from '@mui/icons-material';
import {
  Dialog,
  Button,
  Checkbox,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  DialogContentText,
} from '@mui/material';

const STORAGE_KEY = 'diyyy:safari-print-warning-dismissed';

interface SafariPrintWarningProps {
  open: boolean;
  onClose: () => void;
  onSavePdf: () => void;
  onContinuePrint: () => void;
}

export const SafariPrintWarning: React.FC<SafariPrintWarningProps> = ({
  open,
  onClose,
  onSavePdf,
  onContinuePrint,
}) => {
  const [dismissed, setDismissed] = useState(false);

  const handleSavePdf = useCallback(() => {
    if (dismissed) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    }
    onSavePdf();
    onClose();
  }, [dismissed, onSavePdf, onClose]);

  const handleContinuePrint = useCallback(() => {
    if (dismissed) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    }
    onContinuePrint();
    onClose();
  }, [dismissed, onContinuePrint, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Safari 打印提醒
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Safari 浏览器对打印功能的兼容性有限，可能导致打印预览空白或排版异常。
          建议使用以下替代方案：
        </DialogContentText>
        <DialogContentText component="div" sx={{ mb: 1 }}>
          <strong>推荐方案 1：</strong>使用 <strong>Chrome 浏览器</strong>打开本网站再进行打印。
        </DialogContentText>
        <DialogContentText component="div">
          <strong>推荐方案 2：</strong>使用下方「保存为 PDF」按钮导出 PDF，再通过 PDF 阅读器打印。
        </DialogContentText>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={dismissed}
              onChange={(_, v) => setDismissed(v)}
            />
          }
          label="不再提示"
          sx={{ mt: 2, color: 'text.secondary' }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          取消
        </Button>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handleContinuePrint}
        >
          仍然打印
        </Button>
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={handleSavePdf}
        >
          保存为 PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export function shouldShowSafariWarning(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}
