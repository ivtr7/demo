import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, Save, Upload, Download, RotateCcw, AlertTriangle, Plus, Trash2 
} from 'lucide-react';
import { NicheConfig, ICON_MAP } from '@/data/niches';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    adminSession,
    globalConfig,
    setGlobalConfig,
    niches,
    updateNiche,
    exportConfig,
    importConfig,
    resetAll,
  } = useApp();

  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!adminSession.isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa estar autenticado para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedNiche = niches.find(n => n.id === selectedNicheId);

  const handleExport = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-agent-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Configurações exportadas!' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        if (importConfig(text)) {
          toast({ title: 'Configurações importadas!' });
        } else {
          toast({ title: 'Erro ao importar', variant: 'destructive' });
        }
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações?')) {
      resetAll();
      toast({ title: 'Configurações resetadas!' });
      navigate('/');
    }
  };

  const updateSelectedNiche = (updates: Partial<NicheConfig>) => {
    if (selectedNiche) {
      updateNiche(selectedNiche.id, { ...selectedNiche, ...updates });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showSettings={false} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Configure o sistema de agentes de IA</p>
          </div>
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="global">Config. Global</TabsTrigger>
            <TabsTrigger value="niches">Nichos</TabsTrigger>
          </TabsList>

          {/* Global Configuration */}
          <TabsContent value="global">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Configurações Globais</CardTitle>
                <CardDescription>Configurações gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Nome do App</Label>
                  <Input
                    value={globalConfig.appName}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, appName: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mensagem de Demo</Label>
                  <Textarea
                    value={globalConfig.demoWarning}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, demoWarning: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Tema padrão escuro</Label>
                  <Switch
                    checked={globalConfig.defaultTheme === 'dark'}
                    onCheckedChange={(checked) =>
                      setGlobalConfig({ ...globalConfig, defaultTheme: checked ? 'dark' : 'light' })
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar JSON
                  </Button>
                  <Button variant="outline" onClick={handleImport}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar JSON
                  </Button>
                  <Button variant="destructive" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar Tudo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Niches Editor */}
          <TabsContent value="niches">
            <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
              {/* Niche List */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Nichos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-2">
                      {niches.map((niche) => {
                        const Icon = ICON_MAP[niche.icon];
                        return (
                          <button
                            key={niche.id}
                            onClick={() => setSelectedNicheId(niche.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                              selectedNicheId === niche.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-secondary'
                            }`}
                          >
                            {Icon && <Icon className="h-5 w-5 shrink-0" />}
                            <span className="text-sm font-medium truncate">{niche.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Niche Editor */}
              {selectedNiche ? (
                <NicheEditor niche={selectedNiche} onUpdate={updateSelectedNiche} />
              ) : (
                <Card className="glass flex items-center justify-center h-[600px]">
                  <p className="text-muted-foreground">Selecione um nicho para editar</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Niche Editor Component
function NicheEditor({
  niche,
  onUpdate,
}: {
  niche: NicheConfig;
  onUpdate: (updates: Partial<NicheConfig>) => void;
}) {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: 'Alterações salvas!' });
  };

  return (
    <Card className="glass">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{niche.name}</CardTitle>
          <CardDescription>Edite as configurações deste nicho</CardDescription>
        </div>
        <Button onClick={handleSave} className="gradient-primary">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="identity" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="identity">Identidade</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="intents">Intenções</TabsTrigger>
            <TabsTrigger value="quickreplies">Quick Replies</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome do Agente</Label>
                <Input
                  value={niche.agentName}
                  onChange={(e) => onUpdate({ agentName: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Tom de Voz</Label>
                <Select
                  value={niche.tone}
                  onValueChange={(value: any) => onUpdate({ tone: value })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="neutral">Neutro</SelectItem>
                    <SelectItem value="friendly">Amigável</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prompt do Sistema</Label>
              <Textarea
                value={niche.systemPrompt}
                onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
                className="bg-secondary/50 min-h-[150px]"
              />
            </div>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-4">
            <div className="space-y-2">
              <Label>Mensagem de Saudação</Label>
              <Textarea
                value={niche.onboarding.greeting}
                onChange={(e) =>
                  onUpdate({ onboarding: { ...niche.onboarding, greeting: e.target.value } })
                }
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{AGENT_NAME}'} para inserir o nome do agente
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Label do Negócio</Label>
                <Input
                  value={niche.onboarding.businessLabel}
                  onChange={(e) =>
                    onUpdate({ onboarding: { ...niche.onboarding, businessLabel: e.target.value } })
                  }
                  className="bg-secondary/50"
                  placeholder="clínica, escritório, loja..."
                />
              </div>
              <div className="space-y-2">
                <Label>Nome do Campo Extra</Label>
                <Input
                  value={niche.onboarding.extraFieldName}
                  onChange={(e) =>
                    onUpdate({ onboarding: { ...niche.onboarding, extraFieldName: e.target.value } })
                  }
                  className="bg-secondary/50"
                  placeholder="especialidade, procedimento..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pergunta sobre Negócio</Label>
              <Textarea
                value={niche.onboarding.askBusiness}
                onChange={(e) =>
                  onUpdate({ onboarding: { ...niche.onboarding, askBusiness: e.target.value } })
                }
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Pergunta Extra (específica do nicho)</Label>
              <Textarea
                value={niche.onboarding.askExtra}
                onChange={(e) =>
                  onUpdate({ onboarding: { ...niche.onboarding, askExtra: e.target.value } })
                }
                className="bg-secondary/50"
              />
            </div>
          </TabsContent>

          {/* Intents Tab */}
          <TabsContent value="intents">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {niche.intents.map((intent, index) => (
                  <Card key={intent.id} className="bg-secondary/30">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge>{intent.name}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            const newIntents = niche.intents.filter((_, i) => i !== index);
                            onUpdate({ intents: newIntents });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Palavras-chave (separadas por vírgula)</Label>
                        <Input
                          value={intent.keywords.join(', ')}
                          onChange={(e) => {
                            const newIntents = [...niche.intents];
                            newIntents[index] = {
                              ...intent,
                              keywords: e.target.value.split(',').map((k) => k.trim()),
                            };
                            onUpdate({ intents: newIntents });
                          }}
                          className="bg-secondary/50 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Template de Resposta</Label>
                        <Textarea
                          value={intent.template}
                          onChange={(e) => {
                            const newIntents = [...niche.intents];
                            newIntents[index] = { ...intent, template: e.target.value };
                            onUpdate({ intents: newIntents });
                          }}
                          className="bg-secondary/50 text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const newIntent = {
                      id: `intent-${Date.now()}`,
                      name: 'Nova Intenção',
                      keywords: ['palavra1', 'palavra2'],
                      template: 'Template de resposta...',
                    };
                    onUpdate({ intents: [...niche.intents, newIntent] });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Intenção
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Quick Replies Tab */}
          <TabsContent value="quickreplies">
            <div className="space-y-4">
              {niche.quickReplies.map((qr, index) => (
                <div key={qr.id} className="flex gap-2">
                  <Input
                    value={qr.label}
                    onChange={(e) => {
                      const newQRs = [...niche.quickReplies];
                      newQRs[index] = { ...qr, label: e.target.value };
                      onUpdate({ quickReplies: newQRs });
                    }}
                    placeholder="Label"
                    className="bg-secondary/50"
                  />
                  <Input
                    value={qr.message}
                    onChange={(e) => {
                      const newQRs = [...niche.quickReplies];
                      newQRs[index] = { ...qr, message: e.target.value };
                      onUpdate({ quickReplies: newQRs });
                    }}
                    placeholder="Mensagem"
                    className="bg-secondary/50 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={() => {
                      const newQRs = niche.quickReplies.filter((_, i) => i !== index);
                      onUpdate({ quickReplies: newQRs });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newQR = {
                    id: `qr-${Date.now()}`,
                    label: 'Novo',
                    message: 'Nova mensagem',
                  };
                  onUpdate({ quickReplies: [...niche.quickReplies, newQR] });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Quick Reply
              </Button>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Usar variáveis ({'{USER_NAME}'}, {'{BUSINESS_NAME}'})</Label>
                <Switch
                  checked={niche.rules.useVariables}
                  onCheckedChange={(checked) =>
                    onUpdate({ rules: { ...niche.rules, useVariables: checked } })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Fazer uma pergunta por vez</Label>
                <Switch
                  checked={niche.rules.oneQuestionAtTime}
                  onCheckedChange={(checked) =>
                    onUpdate({ rules: { ...niche.rules, oneQuestionAtTime: checked } })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sugerir próximos passos</Label>
                <Switch
                  checked={niche.rules.suggestNextSteps}
                  onCheckedChange={(checked) =>
                    onUpdate({ rules: { ...niche.rules, suggestNextSteps: checked } })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Respostas curtas por padrão</Label>
                <Switch
                  checked={niche.rules.keepResponsesShort}
                  onCheckedChange={(checked) =>
                    onUpdate({ rules: { ...niche.rules, keepResponsesShort: checked } })
                  }
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Restrições do Agente</Label>
              <Textarea
                value={niche.restrictions}
                onChange={(e) => onUpdate({ restrictions: e.target.value })}
                placeholder="O que o agente NÃO deve fazer..."
                className="bg-secondary/50"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
