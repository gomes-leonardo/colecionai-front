'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, User, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px] bg-muted/50">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="billing">Pagamento</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Atualize seus dados de perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Leonardo Rodrigues" className="bg-muted/50 border-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input id="username" defaultValue="@leorodrigues" className="bg-muted/50 border-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Colecionador de retro games e HQs." className="bg-muted/50 border-input" />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>Escolha como você quer ser notificado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Novos Lances</Label>
                  <p className="text-sm text-muted-foreground">Receba alertas quando alguém cobrir seu lance.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Itens Favoritos</Label>
                  <p className="text-sm text-muted-foreground">Alertas de preço para itens na sua lista de desejos.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing</Label>
                  <p className="text-sm text-muted-foreground">Receba novidades e ofertas exclusivas.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         {/* Security Tab */}
         <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>Proteja sua conta e dados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" className="bg-muted/50 border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" className="bg-muted/50 border-input" />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} variant="outline" className="border-primary text-primary hover:bg-primary/10">Atualizar Senha</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab (Placeholder) */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                Métodos de Pagamento
              </CardTitle>
              <CardDescription>Gerencie seus cartões e histórico de cobrança.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="p-4 rounded-full bg-muted">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nenhum método de pagamento salvo.</p>
                <Button variant="outline">Adicionar Cartão</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
