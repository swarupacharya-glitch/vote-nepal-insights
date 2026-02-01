import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-card/50 py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Nepal Election Candidates Dashboard • Data for civic awareness</p>
          <p className="mt-1 text-xs">नेपाल निर्वाचन उम्मेदवार ड्यासबोर्ड</p>
        </div>
      </footer>
    </div>
  );
}
