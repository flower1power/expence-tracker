'use client';

import Link from 'next/link';
import { DashboardNav } from './DashboardNav';
import { UserProfileMenu } from './UserProfileMenu';

export function DashboardHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              💰 Expense Tracker
            </Link>
            <DashboardNav />
          </div>
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}
