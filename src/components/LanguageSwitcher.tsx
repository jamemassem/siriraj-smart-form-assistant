
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm border p-1">
      <Button
        variant={language === 'th' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('th')}
        className="h-8 px-3 text-xs"
      >
        {t('thai')}
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="h-8 px-3 text-xs"
      >
        {t('english')}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
