import React from 'react';

export const TOOLBAR_SLOT_ID = 'diyyy-toolbar-slot';
export const TITLE_SLOT_ID = 'diyyy-title-slot';

/** Mount point for toolbar buttons — DashboardLayout renders in header rightArea */
export const ToolbarSlotMount: React.FC = () => <div id={TOOLBAR_SLOT_ID} style={{ display: 'contents' }} />;

/** Mount point for tool title — DashboardLayout renders in header leftArea */
export const TitleSlotMount: React.FC = () => <div id={TITLE_SLOT_ID} style={{ display: 'contents' }} />;
