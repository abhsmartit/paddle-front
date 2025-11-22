// src/components/Header.tsx
import {
  ChevronDown,
  Menu,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

interface HeaderProps {
  selectedCourt: string;
  onAddBooking?: () => void;
}

const Header = ({
  selectedCourt,
  onAddBooking,
}: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="header">
      {/* LEFT SIDE – menu + dropdowns */}
      <div className="header-left">
        <Menu size={24} className="menu-icon" />
        <div className="header-dropdowns">
          <div className="dropdown">
            <span>{t('padelHub')}</span>
            <ChevronDown size={18} />
          </div>
          <div className="dropdown">
            <span>{selectedCourt}</span>
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – language flag + add button */}
      <div className="header-right">
        {/* Language flag (🇬🇧 / 🇸🇦) */}
        <LanguageSwitcher />

        {/* Add booking */}
        <button className="icon-button add-button" onClick={onAddBooking}>
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;
