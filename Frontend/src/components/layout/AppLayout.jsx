import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import ToastStack from '../ToastStack';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-canvas text-ink">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-4 sm:px-5 py-5 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
      <ToastStack />
    </div>
  );
}
