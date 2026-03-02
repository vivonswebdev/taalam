/**
 * ✨ ThemeShowcase — Démonstration Thème Taaloum 2026
 * 
 * Showcase des nouvelles couleurs, animations et utilitaires
 * Pour tester visuellement le thème spirituel
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun, Mountain, Waves } from "lucide-react";

export function ThemeShowcase() {
  return (
    <div className="min-h-screen home-bg p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* ═══ HEADER ═══ */}
        <div className="text-center space-y-4 animate-fade-in">
          <Badge className="bg-gradient-paradise text-white border-0 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Thème Taaloum 2026
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Thème Spirituel Moderne
          </h1>
          <p className="text-muted-foreground text-lg">
            Nouvelles couleurs, animations et utilitaires glass morphism
          </p>
        </div>

        {/* ═══ COULEURS SPIRITUELLES ═══ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Couleurs Spirituelles
            </CardTitle>
            <CardDescription>
              3 nouvelles teintes inspirées du monde islamique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pearl */}
              <div className="space-y-3">
                <div className="h-32 bg-pearl rounded-xl border-2 border-primary/20 shadow-lg" />
                <div>
                  <h3 className="font-semibold text-lg">Pearl</h3>
                  <p className="text-sm text-muted-foreground">
                    hsl(40 25% 97%)
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                    bg-pearl
                  </code>
                </div>
              </div>

              {/* Moonlight */}
              <div className="space-y-3">
                <div className="h-32 bg-moonlight rounded-xl border-2 border-accent/20 shadow-lg" />
                <div>
                  <h3 className="font-semibold text-lg">Moonlight</h3>
                  <p className="text-sm text-muted-foreground">
                    hsl(210 30% 94%)
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                    bg-moonlight
                  </code>
                </div>
              </div>

              {/* Desert */}
              <div className="space-y-3">
                <div className="h-32 bg-desert rounded-xl border-2 border-secondary/20 shadow-lg" />
                <div>
                  <h3 className="font-semibold text-lg">Desert</h3>
                  <p className="text-sm text-muted-foreground">
                    hsl(35 45% 88%)
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                    bg-desert
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ GLASS MORPHISM ═══ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Glass Morphism
            </CardTitle>
            <CardDescription>
              Effet verre dépoli avec backdrop-filter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-3">
                <h3 className="font-semibold text-lg">Light Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Fond blanc translucide avec blur(16px)
                </p>
                <code className="text-xs bg-muted/50 px-2 py-1 rounded block">
                  .glass-card
                </code>
              </div>

              <div className="glass-card p-6 space-y-3 glow-emerald">
                <h3 className="font-semibold text-lg">Avec Glow</h3>
                <p className="text-sm text-muted-foreground">
                  Ombre lumineuse émeraude
                </p>
                <code className="text-xs bg-muted/50 px-2 py-1 rounded block">
                  .glass-card .glow-emerald
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ ANIMATIONS ═══ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-primary" />
              Animations Spirituelles
            </CardTitle>
            <CardDescription>
              5 nouvelles animations pour interfaces paisibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pulse Gentle */}
              <div className="space-y-3">
                <div className="h-32 bg-primary rounded-xl flex items-center justify-center text-primary-foreground animate-pulse-gentle">
                  <Moon className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-semibold">Pulse Gentle</h3>
                  <p className="text-xs text-muted-foreground">3s ease-in-out</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                    animate-pulse-gentle
                  </code>
                </div>
              </div>

              {/* Breathe */}
              <div className="space-y-3">
                <div className="h-32 bg-accent rounded-xl flex items-center justify-center text-accent-foreground animate-breathe">
                  <Sun className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-semibold">Breathe</h3>
                  <p className="text-xs text-muted-foreground">2s + shadow pulse</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                    animate-breathe
                  </code>
                </div>
              </div>

              {/* Star Twinkle */}
              <div className="space-y-3">
                <div className="h-32 bg-secondary rounded-xl flex items-center justify-center text-secondary-foreground animate-star-twinkle">
                  <Sparkles className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-semibold">Star Twinkle</h3>
                  <p className="text-xs text-muted-foreground">6s opacity alternate</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                    animate-star-twinkle
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ GRADIENTS ═══ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-gold" />
              Dégradés Spirituels
            </CardTitle>
            <CardDescription>
              Primary → Accent → Secondary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Paradise */}
              <div className="space-y-3">
                <div className="h-32 gradient-paradise rounded-xl shadow-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-2xl">
                    Paradise Gradient
                  </span>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded inline-block">
                  .gradient-paradise
                </code>
              </div>

              {/* Moonlight */}
              <div className="space-y-3">
                <div className="h-32 gradient-moonlight rounded-xl shadow-xl flex items-center justify-center">
                  <span className="text-primary font-semibold text-2xl">
                    Moonlight Gradient
                  </span>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded inline-block">
                  .gradient-moonlight
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ WIDGETS EXEMPLES ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Widget 1 */}
          <Card className="glass-card hover:glow-emerald transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary">Sourates Maîtrisées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary animate-pulse-gentle">
                12/114
              </div>
              <p className="text-muted-foreground mt-2">En progression</p>
            </CardContent>
          </Card>

          {/* Widget 2 */}
          <Card className="glass-card bg-gradient-paradise text-white border-0">
            <CardHeader>
              <CardTitle>Streak Actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold animate-breathe">
                7 jours 🔥
              </div>
              <p className="text-white/80 mt-2">Continue comme ça !</p>
            </CardContent>
          </Card>

          {/* Widget 3 */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-accent">Prochaine Prière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-accent animate-star-twinkle">
                Dhuhr
              </div>
              <p className="text-muted-foreground mt-2">Dans 1h 23min</p>
            </CardContent>
          </Card>
        </div>

        {/* ═══ BOUTONS ═══ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Boutons avec nouveau thème</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="default" className="animate-breathe">
                Primary Button
              </Button>
              <Button variant="secondary">
                Secondary Button
              </Button>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                Accent Outline
              </Button>
              <Button className="bg-gradient-paradise border-0 text-white">
                Paradise Gradient
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ═══ FOOTER ═══ */}
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            ✨ Thème Taaloum 2026 — Spirituel, Moderne, Performant
          </p>
        </div>
      </div>
    </div>
  );
}
