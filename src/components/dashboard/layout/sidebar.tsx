'use client';

import { Album, CreditCard, Home, GraduationCap, Users, Building, School } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: <Home className="h-6 w-6" />,
    href: '/dashboard',
  },
  {
    title: 'Subscriptions',
    icon: <Album className="h-6 w-6" />,
    href: '/dashboard/subscriptions',
  },
  {
    title: 'Payments',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/dashboard/payments',
  },
];

const schoolAdminItems = [
  {
    title: 'School Admin',
    icon: <School className="h-6 w-6" />,
    href: '/school-admin',
  },
  {
    title: 'Schools',
    icon: <Building className="h-6 w-6" />,
    href: '/school-admin/schools',
  },
  {
    title: 'Departments',
    icon: <Building className="h-6 w-6" />,
    href: '/school-admin/departments',
  },
  {
    title: 'Students',
    icon: <Users className="h-6 w-6" />,
    href: '/school-admin/students',
  },
];

const studentPortalItems = [
  {
    title: 'Student Portal',
    icon: <GraduationCap className="h-6 w-6" />,
    href: '/student-portal',
  },
  {
    title: 'Enrollment',
    icon: <GraduationCap className="h-6 w-6" />,
    href: '/student-portal/enrollment',
  },
  {
    title: 'My Payments',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/student-portal/payments',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  
  // Determine which section to show based on current path
  const isSchoolAdmin = pathname.startsWith('/school-admin');
  const isStudentPortal = pathname.startsWith('/student-portal');
  
  let currentItems = sidebarItems;
  if (isSchoolAdmin) {
    currentItems = schoolAdminItems;
  } else if (isStudentPortal) {
    currentItems = studentPortalItems;
  }

  return (
    <nav className="flex flex-col grow justify-between items-start px-2 text-sm font-medium lg:px-4">
      <div className={'w-full'}>
        {currentItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn('flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items', {
              'dashboard-sidebar-items-active':
                item.href === '/dashboard' ? pathname === item.href : pathname.includes(item.href),
            })}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
        
        {/* Show navigation links to other sections */}
        {!isSchoolAdmin && !isStudentPortal && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              School Fee System
            </div>
            <Link
              href="/school-admin"
              className="flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items"
            >
              <School className="h-6 w-6" />
              School Admin
            </Link>
            <Link
              href="/student-portal"
              className="flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items"
            >
              <GraduationCap className="h-6 w-6" />
              Student Portal
            </Link>
          </div>
        )}
        
        {(isSchoolAdmin || isStudentPortal) && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Other Sections
            </div>
            <Link
              href="/dashboard"
              className="flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items"
            >
              <Home className="h-6 w-6" />
              Main Dashboard
            </Link>
            {!isSchoolAdmin && (
              <Link
                href="/school-admin"
                className="flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items"
              >
                <School className="h-6 w-6" />
                School Admin
              </Link>
            )}
            {!isStudentPortal && (
              <Link
                href="/student-portal"
                className="flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items"
              >
                <GraduationCap className="h-6 w-6" />
                Student Portal
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}