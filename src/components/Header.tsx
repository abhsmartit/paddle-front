// src/components/Header.tsx
import {
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { Button } from '@/components/ui/button';
import padelHubLogo from "../assets/image.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  selectedCourt: string;
  onAddBooking?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Header = ({
  selectedCourt,
  onAddBooking,
  onToggleSidebar,
  isSidebarOpen = true,
}: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between">
      {/* LEFT SIDE – menu + dropdowns */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden h-9 w-9 p-0" 
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Desktop sidebar toggle */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden md:flex h-9 w-9 p-0" 
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </Button>
        
        {/* Mobile logo */}
        <div className="md:hidden flex items-center">
          <img
            src={padelHubLogo}
            alt="The Padel Hub"
            className="h-6 w-auto object-contain max-w-[120px] dark:brightness-0 dark:invert"
          />
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span>{t('padelHub')}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <div className="p-2 text-sm text-muted-foreground">
                Club management options
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span className="truncate max-w-48">{selectedCourt}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <div className="p-2 text-sm text-muted-foreground">
                Court management options
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* RIGHT SIDE – language flag + theme + add button */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />

        <Button 
          onClick={onAddBooking}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Booking</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
