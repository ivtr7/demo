import { NicheConfig, ICON_MAP } from '@/data/niches';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface NicheCardProps {
  niche: NicheConfig;
  onClick: () => void;
  index: number;
}

export default function NicheCard({ niche, onClick, index }: NicheCardProps) {
  const Icon = ICON_MAP[niche.icon] || ICON_MAP.Stethoscope;

  return (
    <Card 
      className="group glass hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up border-border/50 hover:border-primary/30"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 group-hover:shadow-glow transition-shadow duration-300">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {niche.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {niche.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
          >
            Ver demo
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
