
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const AuthUserMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get display info (initial + email) for any user
  const getInitial = () => {
    if (user) {
      // Prioritize full_name for initial if available
      if (user.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.length > 0) {
        return user.user_metadata.full_name[0].toUpperCase();
      }
      // Fallback to email
      if (user.email && typeof user.email === 'string' && user.email.length > 0) {
        return user.email[0].toUpperCase();
      }
    }
    return 'U'; // Default if no user or no name/email
  };

  const getDisplayEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  const getAvatarUrl = () => {
    // Ensure user and metadata exist before accessing avatar_url
    return user?.user_metadata?.avatar_url || '';
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  // Determine avatar values once
  const avatarUrl = getAvatarUrl();
  const avatarInitial = getInitial();

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm">Sign In</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {getDisplayEmail() && (
        <span className="hidden md:inline-block text-sm text-muted-foreground max-w-[150px] truncate">
          {getDisplayEmail()}
        </span>
      )}
      <Button
        variant="ghost"
        className="rounded-full p-0 w-9 h-9"
        aria-label="Profile"
        onClick={handleProfileClick}
      >
        <Avatar className="h-8 w-8">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="User Avatar" />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {avatarInitial}
            </AvatarFallback>
          )}
        </Avatar>
      </Button>
    </div>
  );
};

// Fix missing import
import { Link } from 'react-router-dom';
