import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import NicheCard from '@/components/NicheCard';
import ChatInterface from '@/components/ChatInterface';
import SettingsDrawer from '@/components/SettingsDrawer';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Index() {
  const { niches, currentNicheId, setCurrentNicheId, resetChat } = useApp();
  const [search, setSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const filteredNiches = useMemo(() => {
    if (!search.trim()) return niches;
    const lower = search.toLowerCase();
    return niches.filter(
      (n) =>
        n.name.toLowerCase().includes(lower) ||
        n.description.toLowerCase().includes(lower)
    );
  }, [niches, search]);

  const handleSelectNiche = (id: string) => {
    resetChat();
    setCurrentNicheId(id);
  };

  const handleBack = () => {
    setCurrentNicheId(null);
    resetChat();
  };

  // Show chat if niche is selected
  if (currentNicheId) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSettings={false} />
        <ChatInterface 
          onBack={handleBack} 
          onOpenSettings={() => setShowSettings(true)} 
        />
        <SettingsDrawer open={showSettings} onOpenChange={setShowSettings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Demonstração</span> de Agente de IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Escolha seu segmento e veja como a IA atende e organiza automaticamente.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nicho..."
              className="pl-10 bg-secondary/50"
            />
          </div>
        </div>

        {/* Niche Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNiches.map((niche, index) => (
            <NicheCard
              key={niche.id}
              niche={niche}
              index={index}
              onClick={() => handleSelectNiche(niche.id)}
            />
          ))}
        </div>

        {filteredNiches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum nicho encontrado para "{search}"
          </div>
        )}
      </main>

      <SettingsDrawer open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
