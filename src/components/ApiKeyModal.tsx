
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Development - API Key Setup
          </DialogTitle>
          <DialogDescription>
            กรุณากรอก OpenRouter API Key เพื่อใช้งานระบบในโหมด Development
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
              OpenRouter API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="sk-or-v1-..."
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              บันทึก
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              ข้าม
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Key จะถูกเก็บใน localStorage สำหรับการพัฒนาเท่านั้น
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
