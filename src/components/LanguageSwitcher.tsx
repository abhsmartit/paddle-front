// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const isEnglish = i18n.language === 'en';

  return (
    <button
      className="language-switcher icon-button"
      type="button"
      onClick={toggleLanguage}
      aria-label={isEnglish ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span className="flag-icon" aria-hidden="true">
        {isEnglish ? '🇬🇧' : '🇸🇦'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
