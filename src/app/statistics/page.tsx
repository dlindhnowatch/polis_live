import StatisticsDashboard from '@/components/Statistics/StatisticsDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statistik - Swedish Police Events',
  description: 'Visa detaljerad statistik för polishändelser i olika regioner i Sverige',
};

export default function StatisticsPage() {
  return <StatisticsDashboard />;
}
