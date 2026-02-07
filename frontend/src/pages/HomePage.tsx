import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Wallet,
  CalendarRange,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary">H</span>
            </div>
            Hayde
          </div>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>לוח בקרה</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">התחברות</Button>
                </Link>
                <Link to="/register">
                  <Button>הרשמה חינם</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <Link
              to="/register"
              className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted/80"
            >
              🎉 גרסה חדשה זמינה עכשיו
            </Link>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              תכנון חתונה <span className="text-primary">חכם ופשוט</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              נהלו את כל פרטי החתונה שלכם במקום אחד. תקציב, מוזמנים, משימות ועוד - הכל בממשק נוח ומתקדם.
            </p>
            <div className="flex gap-4">
              <Link to="/register">
                <Button size="lg" className="h-11 px-8 text-base">
                  התחילו עכשיו בחינם
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="h-11 px-8 text-base">
                  כניסה למערכת
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-display text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              כלים מתקדמים לניהול
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              כל מה שצריך כדי להפיק אירוע מושלם, בלי כאבי ראש.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card>
              <CardHeader>
                <Wallet className="h-10 w-10 text-primary mb-2" />
                <CardTitle>ניהול תקציב</CardTitle>
                <CardDescription>
                  מעקב מלא אחרי הוצאות והכנסות, גרפים וסטטיסטיקות בזמן אמת.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>ניהול מוזמנים</CardTitle>
                <CardDescription>
                  רשימות מוזמנים, אישורי הגעה דיגיטליים וסידורי ישיבה.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CalendarRange className="h-10 w-10 text-primary mb-2" />
                <CardTitle>משימות ולו"ז</CardTitle>
                <CardDescription>
                  צ'ק ליסט מובנה לחתונה שדואג שלא תשכחו שום דבר חשוב.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
            <div className="flex flex-col items-center justify-center space-y-2 border-l border-muted p-6 text-center first:border-0">
              <span className="text-4xl font-bold">1000+</span>
              <span className="text-muted-foreground text-sm">חתונות שתוכננו</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border-l border-muted p-6 text-center">
              <span className="text-4xl font-bold text-primary">₪50M+</span>
              <span className="text-muted-foreground text-sm">תקציבים נוהלו</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border-l border-muted p-6 text-center">
              <span className="text-4xl font-bold">50k+</span>
              <span className="text-muted-foreground text-sm">מוזמנים</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border-l border-muted p-6 text-center">
              <span className="text-4xl font-bold text-primary">4.9</span>
              <span className="text-muted-foreground text-sm">דירוג ממוצע</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="relative rounded-3xl bg-primary px-6 py-16 md:px-12 md:py-24 overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
                מוכנים להתחיל לתכנן?
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
                הצטרפו למאות זוגות שכבר מתכננים את החתונה שלהם איתנו.
                נסיון חינם, ללא התחייבות.
              </p>
              <Link to="/register">
                <Button variant="secondary" size="lg" className="rounded-full px-8">
                  הרשמה בחינם
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/20 blur-[100px] rounded-full pointer-events-none" />
          </div>
        </section>

      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
