
import React from 'react';
import ThreeColumnLayout from '@/components/ThreeColumnLayout';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LanguageProvider } from '@/contexts/LanguageContext';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="relative">
        {/* Language Switcher - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        
        {/* Main Content */}
        <ThreeColumnLayout />
      </div>
    </LanguageProvider>
  );
};

export default Index;
