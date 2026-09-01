import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LeaguesPage } from './routes/LeaguesPage';
import { LeagueDetailPage } from './routes/LeagueDetailPage';
import { MatchupsPage } from './routes/MatchupsPage';
import { PlayersPage } from './routes/PlayersPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LeaguesPage /> },
      { path: 'league/:leagueId', element: <LeagueDetailPage /> },
      { path: 'league/:leagueId/matchups', element: <MatchupsPage /> },
      { path: 'players', element: <PlayersPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
