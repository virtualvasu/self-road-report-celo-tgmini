// import { useState } from 'react';

import { useEffect, useState } from 'react';
import { getTelegram, isTelegram } from '../lib/telegram';
import ProjectIntroPage from './ProjectIntroPage';
import LandingPage from './LandingPage';
import IncidentWizard from './IncidentWizard';
import IncidentDashboard from './IncidentDashboard';
import RewardsTracker from './RewardsTracker';

type AppMode = 'intro' | 'landing' | 'report' | 'dashboard' | 'rewards';

export default function IncidentManager() {
  const [mode, setMode] = useState<AppMode>('intro');

  useEffect(() => {
    if (isTelegram()) {
      setMode('landing');
    }
  }, []);

  useEffect(() => {
    if (!isTelegram()) return;
    const tg = getTelegram();
    const canGoBack = mode !== 'intro' && mode !== 'landing';
    if (canGoBack) {
      tg?.BackButton.show();
      const handler = () => setMode('landing');
      tg?.BackButton.onClick(handler);
      return () => tg?.BackButton.offClick(handler);
    } else {
      tg?.BackButton.hide();
    }
  }, [mode]);

  if (mode === 'intro') {
    return <ProjectIntroPage onContinue={() => setMode('landing')} />;
  }

  if (mode === 'landing') {
    return (
      <LandingPage
        onReportIncident={() => setMode('report')}
        onViewDashboard={() => setMode('dashboard')}
        onViewRewards={() => setMode('rewards')}
      />
    );
  }

  if (mode === 'report') {
    return <IncidentWizard onBackToHome={() => setMode('landing')} />;
  }

  if (mode === 'dashboard') {
    return <IncidentDashboard onBack={() => setMode('landing')} />;
  }

  if (mode === 'rewards') {
    return <RewardsTracker onBack={() => setMode('landing')} />;
  }

  return null;
}