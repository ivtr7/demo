import { Lock, Moon, Sun, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLoginModal from './AdminLoginModal';

interface HeaderProps {
  onOpenSettings?: () => void;
  showSettings?: boolean;
}

export default function Header({ onOpenSettings, showSettings = true }: HeaderProps) {
  const { theme, setTheme, globalConfig, adminSession } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="glass-strong sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground">{globalConfig.appName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {showSettings && onOpenSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/demo')}
              className="text-muted-foreground hover:text-foreground"
              title="Ver Landing Page Demo"
            >
              <Play className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogin(true)}
              className={adminSession.isAuthenticated 
                ? "text-accent hover:text-accent" 
                : "text-muted-foreground hover:text-foreground"
              }
              title={adminSession.isAuthenticated ? "Área Admin (logado)" : "Login Admin"}
            >
              <Lock className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <AdminLoginModal open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
