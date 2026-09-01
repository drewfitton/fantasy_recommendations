import { NavLink, Outlet } from 'react-router-dom';
import { UserSwitcher } from './UserSwitcher';

export function AppShell() {
  return (
    <>
      <nav className="nav">
        <span className="nav-brand">Fantasy Tracker</span>
        <NavLink to="/" end>
          Leagues
        </NavLink>
        <NavLink to="/players">Players</NavLink>
        <UserSwitcher />
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
