import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'outline', 
  size = 'default',
  className 
}) => {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    // No need to set isLoggingOut(false) since we're navigating away
  };

  return (
    <div className="flex items-center gap-2">
      {user && (
        <span className="text-sm text-gray-600 hidden sm:inline">
          Welcome, {user.username}
        </span>
      )}
      <Button
        variant={variant}
        size={size}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={className}
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Signing out...
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </>
        )}
      </Button>
    </div>
  );
};

export default LogoutButton;