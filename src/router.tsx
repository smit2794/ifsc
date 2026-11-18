// src/router.tsx
import { lazy } from 'react';
import { createHashRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Code-split pages with React.lazy
const CommandCentrePage = lazy(() => import('./pages/CommandCentre/CommandCentrePage'));
const TasksPage = lazy(() => import('./pages/Tasks/TasksPage'));
const ObligationsPage = lazy(() => import('./pages/Obligations/ObligationsPage'));
const GovernancePage = lazy(() => import('./pages/Governance/GovernancePage'));
const ClientsPage = lazy(() => import('./pages/Clients/ClientsPage'));
const CaseDetailPage = lazy(() => import('./pages/Clients/CaseDetailPage'));
const ControlsPage = lazy(() => import('./pages/Controls/ControlsPage'));
const IncidentsPage = lazy(() => import('./pages/Incidents/IncidentsPage'));
const IncidentDetailPage = lazy(() => import('./pages/Incidents/IncidentDetailPage'));
const CyberVendorsPage = lazy(() => import('./pages/CyberVendors/CyberVendorsPage'));
const ComplaintsPage = lazy(() => import('./pages/Complaints/ComplaintsPage'));
const ComplaintDetailPage = lazy(() => import('./pages/Complaints/ComplaintDetailPage'));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'));
const EvidencePage = lazy(() => import('./pages/Evidence/EvidencePage'));
const AIPage = lazy(() => import('./pages/AIInvestigations/AIPage'));
const IntegrationsPage = lazy(() => import('./pages/Integrations/IntegrationsPage'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
const MetricsPage = lazy(() => import('./pages/Metrics/MetricsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <CommandCentrePage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'obligations',
        element: <ObligationsPage />,
      },
      {
        path: 'governance',
        element: <GovernancePage />,
      },
      {
        path: 'clients',
        element: <ClientsPage />,
      },
      {
        path: 'clients/cases/:id',
        element: <CaseDetailPage />,
      },
      {
        path: 'controls',
        element: <ControlsPage />,
      },
      {
        path: 'incidents',
        element: <IncidentsPage />,
      },
      {
        path: 'incidents/:id',
        element: <IncidentDetailPage />,
      },
      {
        path: 'cyber-vendors',
        element: <CyberVendorsPage />,
      },
      {
        path: 'complaints',
        element: <ComplaintsPage />,
      },
      {
        path: 'complaints/:id',
        element: <ComplaintDetailPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'evidence',
        element: <EvidencePage />,
      },
      {
        path: 'ai',
        element: <AIPage />,
      },
      {
        path: 'integrations',
        element: <IntegrationsPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'metrics',
        element: <MetricsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
