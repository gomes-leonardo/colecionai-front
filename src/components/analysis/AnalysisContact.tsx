'use client';

import { Linkedin, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function AnalysisContact() {
  const handleLinkedIn = () => {
    window.open('https://www.linkedin.com/in/gomess-leonardo/', '_blank');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5511983937790', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:leonardorgomes67@gmail.com', '_blank');
  };

  return (
    <Card className="border-border bg-background">
      <CardHeader>
        <CardTitle className="text-xl">Entre em Contato</CardTitle>
        <CardDescription>
          Este é um projeto de portfólio. Gostaria de conversar sobre desenvolvimento ou oportunidades?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLinkedIn}
        >
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn - Leonardo Gomes
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleWhatsApp}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp - (11) 98393-7790
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleEmail}
        >
          <Mail className="w-4 h-4 mr-2" />
          leonardorgomes67@gmail.com
        </Button>
      </CardContent>
    </Card>
  );
}


