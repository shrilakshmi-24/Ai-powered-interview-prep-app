import React from "react";
import AppHeader from "./_components/AppHeader";

export default function dashboardLayout({ children }: any) {
  return (
    <div>
      <AppHeader />
      {children}
    </div>
  );
}
