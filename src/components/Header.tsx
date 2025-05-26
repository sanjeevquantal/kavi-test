
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import NavMenu from './NavMenu';
import { MobileNavigation } from './MobileNavigation';
import { AuthUserMenu } from './AuthUserMenu';

interface HeaderProps {
  navigationLinks: Array<{
    label: string;
    icon: React.ReactNode;
    href: string;
    active: boolean;
  }>;
}

export const Header: React.FC<HeaderProps> = ({ navigationLinks }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="border-b bg-background/95 backdrop-blur-sm z-10 sticky top-0">
      <div className="container flex justify-between items-center py-3 px-4 md:px-6">
        <Link to="/" className="text-xl font-bold text-primary">
          KAVI
        </Link>

        {isMobile ? (
          // Mobile Navigation
          <div className="flex items-center gap-2">
            <MobileNavigation navigationLinks={navigationLinks} />
          </div>
        ) : (
          // Desktop Navigation
          <>
            {user && (
              <div className="flex items-center space-x-4">
                <NavMenu />
              </div>
            )}

            <div className="flex items-center gap-3">
              <AuthUserMenu />
            </div>
          </>
        )}
      </div>
    </header>
  );
};
