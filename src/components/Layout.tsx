
// import React from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { User, BookOpen, Menu } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useAuth } from '@/contexts/AuthContext';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import {
//   Sheet,
//   SheetContent,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { useIsMobile } from '@/hooks/use-mobile';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const location = useLocation();
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const isMobile = useIsMobile();
  
//   // Get display info (initial + email) for any user
//   const getInitial = () => {
//     if (user) {
//       if (user.email && typeof user.email === 'string') {
//         return user.email[0].toUpperCase();
//       }
//       if (user.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string') {
//         return user.user_metadata.full_name[0].toUpperCase();
//       }
//     }
//     return 'U';
//   };

//   const getDisplayEmail = () => {
//     // Only return email if we have a current user
//     if (!user) return '';
//     return user.email || '';
//   };

//   const getAvatarUrl = () => {
//     return user?.user_metadata?.avatar_url || '';
//   };

//   const navigationLinks = [
//     // Commented out the "Your Stories" tab
    
//     {
//       label: "Your Stories",
//       icon: <BookOpen size={18} />,
//       href: "/stories",
//       active: location.pathname === '/stories'
//     }
  
//   ];

//   const handleProfileClick = () => {
//     if (user) {
//       navigate('/profile');
//     } else {
//       navigate('/auth');
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Top Navbar */}
//       <header className="border-b bg-background/95 backdrop-blur-sm z-10 sticky top-0">
//         <div className="container flex justify-between items-center py-3 px-4 md:px-6">
//           <Link to="/" className="text-xl font-bold text-primary">
//             KAVI
//           </Link>
          
//           {isMobile ? (
//             <div className="flex items-center gap-2">
//               <Sheet>
//                 <SheetTrigger asChild>
//                   <Button variant="ghost" size="icon" aria-label="Menu">
//                     <Menu size={20} />
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent side="right" className="w-[250px] pt-12">
//                   <nav className="flex flex-col gap-4">
//                     {navigationLinks.map((link) => (
//                       <Link to={link.href} key={link.href}>
//                         <Button 
//                           variant={link.active ? "default" : "ghost"}
//                           className="w-full justify-start gap-2"
//                         >
//                           {link.icon}
//                           {link.label}
//                         </Button>
//                       </Link>
//                     ))}
                    
//                     {user ? (
//                       <div className="flex flex-col gap-2">
//                         {getDisplayEmail() && (
//                           <div className="flex items-center gap-2 px-1">
//                             <Avatar className="h-5 w-5">
//                               {getAvatarUrl() ? (
//                                 <AvatarImage src={getAvatarUrl()} />
//                               ) : (
//                                 <AvatarFallback className="text-xs">
//                                   {getInitial()}
//                                 </AvatarFallback>
//                               )}
//                             </Avatar>
//                             <span className="truncate text-xs">{getDisplayEmail()}</span>
//                           </div>
//                         )}
//                         <Button 
//                           variant="outline" 
//                           className="w-full justify-start gap-2"
//                           onClick={handleProfileClick}
//                         >
//                           Profile
//                         </Button>
//                       </div>
//                     ) : (
//                       <Link to="/auth">
//                         <Button variant="outline" className="w-full justify-start">
//                           Sign In
//                         </Button>
//                       </Link>
//                     )}
//                   </nav>
//                 </SheetContent>
//               </Sheet>
//             </div>
//           ) : (
//             <>
//               <div className="flex items-center space-x-1">
//                 {navigationLinks.map((link) => (
//                   <Link to={link.href} key={link.href}>
//                     <Button 
//                       variant={link.active ? "default" : "ghost"}
//                       className="flex items-center gap-2"
//                     >
//                       {link.icon}
//                       {link.label}
//                     </Button>
//                   </Link>
//                 ))}
//               </div>
              
//               <div className="flex items-center gap-3">
//                 {user ? (
//                   <div className="flex items-center gap-2">
//                     {getDisplayEmail() && (
//                       <span className="hidden md:inline-block text-xs text-muted-foreground max-w-[120px] truncate">
//                         {getDisplayEmail()}
//                       </span>
//                     )}
//                     <Button 
//                       variant="ghost" 
//                       className="rounded-full p-2" 
//                       aria-label="Profile"
//                       onClick={handleProfileClick}
//                     >
//                       <Avatar className="h-8 w-8">
//                         {getAvatarUrl() ? (
//                           <AvatarImage src={getAvatarUrl()} />
//                         ) : (
//                           <AvatarFallback className="bg-primary text-primary-foreground text-sm">
//                             {getInitial()}
//                           </AvatarFallback>
//                         )}
//                       </Avatar>
//                     </Button>
//                   </div>
//                 ) : (
//                   <Link to="/auth">
//                     <Button variant="outline" size="sm">Sign In</Button>
//                   </Link>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </header>
      
//       <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Layout;
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, BookOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

// Define the interface for navigation links
interface NavigationLink {
  label: string;
  icon: React.ReactNode;
  href: string;
  active: boolean;
  requiresAuth?: boolean; // <-- Add this property
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth(); // Get user state from context
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  // Define *all* possible navigation links
  const allNavigationLinks: NavigationLink[] = [
    {
      label: "Your Stories",
      icon: <BookOpen size={18} />,
      href: "/stories",
      active: location.pathname === '/stories',
      requiresAuth: true // <-- Mark this link as requiring authentication
    }
    // Add other public links here if needed, without `requiresAuth: true`
  ];

  // Filter links based on authentication status
  const displayedNavigationLinks = allNavigationLinks.filter(link => {
    // If a link requires auth, only include it if a user exists.
    // If a link does *not* require auth (or requiresAuth is falsy), always include it.
    return !link.requiresAuth || (link.requiresAuth && user);
  });


  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      // Should not happen if profile button only shown when logged in,
      // but good practice to handle the else case.
      navigate('/auth');
    }
  };

  // Determine avatar values *once*
  const avatarUrl = getAvatarUrl();
  const avatarInitial = getInitial();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="border-b bg-background/95 backdrop-blur-sm z-10 sticky top-0">
        <div className="container flex justify-between items-center py-3 px-4 md:px-6">
          <Link to="/" className="text-xl font-bold text-primary">
            KAVI
          </Link>

          {isMobile ? (
            // --- Mobile Navigation ---
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menu">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] pt-12">
                  <nav className="flex flex-col gap-4">
                    {/* Map over the FILTERED links */}
                    {displayedNavigationLinks.map((link) => (
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
                      // Use a div or React.Fragment if no extra styling needed
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
                          variant="ghost" // Keep consistent with nav items
                          className="w-full justify-start gap-2"
                          onClick={handleProfileClick}
                        >
                           <User size={18} /> {/* Added icon */}
                          Profile
                        </Button>
                         {/* Add Logout Button here if needed */}
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
            </div>
          ) : (
             // --- Desktop Navigation ---
            <>
              <div className="flex items-center space-x-1">
                {/* Map over the FILTERED links */}
                {displayedNavigationLinks.map((link) => (
                  <Link to={link.href} key={link.href}>
                    <Button
                      variant={link.active ? "default" : "ghost"}
                      className="flex items-center gap-2"
                    >
                      {link.icon}
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  // User is logged in - show email and avatar button
                  <div className="flex items-center gap-2">
                    {getDisplayEmail() && (
                      <span className="hidden md:inline-block text-sm text-muted-foreground max-w-[150px] truncate">
                        {getDisplayEmail()}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      className="rounded-full p-0 w-9 h-9" // Make it perfectly round, adjust padding/size
                      aria-label="Profile"
                      onClick={handleProfileClick}
                    >
                      <Avatar className="h-8 w-8"> {/* Ensure Avatar size matches button */}
                        {avatarUrl ? (
                          // Render image if URL exists
                          <AvatarImage src={avatarUrl} alt="User Avatar" />
                        ) : (
                          // Render fallback if no URL
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                            {avatarInitial}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </div>
                ) : (
                  // User not logged in - show Sign In button
                  <Link to="/auth">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;