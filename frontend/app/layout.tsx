import React from 'react';
import Providers from './components/Providers';
import './globals.css';

export const metadata = {
  title: 'WMS Warehouse Management System',
  description: 'Manage your warehouses efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
