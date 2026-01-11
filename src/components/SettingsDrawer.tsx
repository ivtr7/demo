import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const {
    theme,
    setTheme,
    resetChat,
  } = useApp();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-strong w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configurações</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <Label>Tema escuro</Label>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          {/* Reset Chat */}
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={resetChat} className="w-full">
              Reiniciar conversa
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
