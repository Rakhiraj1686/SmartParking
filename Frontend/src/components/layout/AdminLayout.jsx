import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ToastStack from '../ToastStack';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-canvas text-ink">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader />
        <main className="flex-1 px-4 sm:px-6 py-5 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <ToastStack />
    </div>
  );
}
