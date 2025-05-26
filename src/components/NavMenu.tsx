
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

const NavMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Button
            variant={location.pathname === '/stories' ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => navigate('/stories')}
          >
            <BookOpen size={18} />
            Your Stories
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavMenu;
