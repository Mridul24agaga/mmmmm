import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Facebook, Twitter } from 'lucide-react';

interface SocialSharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platform: 'facebook' | 'twitter' | 'none') => void;
}

export function SocialSharePopup({ isOpen, onClose, onShare }: SocialSharePopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your post</DialogTitle>
          <DialogDescription>
            Would you like to share this post on other platforms?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center space-x-4 mt-4">
          <Button onClick={() => onShare('facebook')} className="flex items-center">
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
          <Button onClick={() => onShare('twitter')} className="flex items-center">
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </Button>
          <Button onClick={() => onShare('none')} variant="outline">
            No, thanks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

