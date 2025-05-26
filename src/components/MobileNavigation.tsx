
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavigationProps {
  navigationLinks: Array<{
    label: string;
    icon: React.ReactNode;
    href: string;
    active: boolean;
  }>;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ navigationLinks }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper functions for user display
  const getInitial = () => {
    if (user) {
      if (user.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.length > 0) {
        return user.user_metadata.full_name[0].toUpperCase();
      }
      if (user.email && typeof user.email === 'string' && user.email.length > 0) {
        return user.email[0].toUpperCase();
      }
    }
    return 'U';
  };

  const getDisplayEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || '';
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const avatarUrl = getAvatarUrl();
  const avatarInitial = getInitial();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] pt-12">
        <nav className="flex flex-col gap-4">
          {/* Map over nav links */}
          {navigationLinks.map((link) => (
            <Link to={link.href} key={link.href} className="block">
              <Button
                variant={link.active ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                {link.icon}
                {link.label}
              </Button>
            </Link>
          ))}

          {/* User Profile / Sign In Button */}
          {user ? (
            <div className="flex flex-col gap-2 mt-4 border-t pt-4">
              {/* Display email and mini-avatar */}
              {getDisplayEmail() && (
                <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="User Avatar" />
                    ) : (
                      <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                        {avatarInitial}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="truncate">{getDisplayEmail()}</span>
                </div>
              )}
              {/* Profile Button */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleProfileClick}
              >
                <User size={18} />
                Profile
              </Button>
            </div>
          ) : (
            <div className="mt-4 border-t pt-4">
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full justify-start">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
