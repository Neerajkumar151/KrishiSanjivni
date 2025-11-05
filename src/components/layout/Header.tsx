import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sprout, User, LogOut, ChevronDown } from 'lucide-react';
import { LanguageSelector } from '../ui/language-selector';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
    const { t } = useTranslation();
    const { user, profile, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/'); 
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Define global callback once
        if (!(window as any).googleTranslateElementInit) {
            (window as any).googleTranslateElementInit = () => {
                const container = document.getElementById('google_translate_element');
                if (!container) return;

                // Clear any previous widget to avoid duplicates
                container.innerHTML = '';

                new (window as any).google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,hi,ta,te,bn',
                        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                    },
                    'google_translate_element'
                );
            };
        }

        // Add the Google Translate script only once
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else {
            // If script already exists, just initialize the widget
            (window as any).googleTranslateElementInit();
        }
    }, []); // ✅ Run only once

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg">
                            <Sprout className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-xl text-gray-900">{t('logo.KrishiSanjivni')}</div>
                            <div className="text-xs text-green-600 font-medium">{t('logo.tagline')}</div>
                        </div>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">
                        {t('nav.home')}
                    </Link>
                    <Link to="/tools" className="text-foreground/80 hover:text-foreground transition-colors">
                        {t('nav.tools')}
                    </Link>
                    <Link to="/warehouse" className="text-foreground/80 hover:text-foreground transition-colors">
                        {t('nav.warehouse')}
                    </Link>
                    <Link to="/soil-check" className="text-foreground/80 hover:text-foreground transition-colors">
                        {t('nav.soilCheck')}
                    </Link>
                    <Link to="/community" className="text-foreground/80 hover:text-foreground transition-colors">
                        {t('nav.community')}
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors">
                                {t('nav.more')}
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-popover z-50">
                            <DropdownMenuItem asChild>
                                <Link to="/resources" className="cursor-pointer">
                                    {t('nav.resources')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/weather" className="cursor-pointer">
                                    {t('nav.weather')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/market-prices" className="cursor-pointer">
                                    {t('nav.marketPrices')}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {isAdmin && (
                        <Link 
                            to="/admin" 
                            className="text-red-600 border border-red-600 px-2 py-1 rounded-full text-foreground/80 hover:text-foreground transition-colors font-medium" 
                        >
                            {t('nav.adminPanel')}
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    <div id="google_translate_element" className="google-translate-dropdown" />
                    <LanguageSelector />

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {profile?.full_name || user.email?.split('@')[0]}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate('/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    {t('nav.profile')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/payment-history')}>
                                    <User className="mr-2 h-4 w-4" />
                                    {t('nav.paymentHistory')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {t('nav.logout')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-700" asChild variant="default">
                            <Link to="/auth">{t('nav.login')}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};
