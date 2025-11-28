// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-9 w-9 p-0"
      aria-label={isEnglish ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span className="text-lg" aria-hidden="true">
        {isEnglish ? '🇬🇧' : '🇸🇦'}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
