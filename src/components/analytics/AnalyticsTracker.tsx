
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackView = async () => {
            try {
                // Tentativa de obter dados de geolocalização simples
                // Usando ipapi.co (limite gratuito de 1000 requests/dia)
                const geoRes = await fetch('https://ipapi.co/json/').catch(() => null);
                const geoData = geoRes && geoRes.ok ? await geoRes.json() : {};

                const { error } = await supabase.from('page_views' as any).insert({
                    path: location.pathname + location.hash,
                    user_agent: navigator.userAgent,
                    city: geoData.city || null,
                    region: geoData.region || null,
                    country: geoData.country_name || null,
                    ip: geoData.ip || null,
                    session_id: sessionStorage.getItem('analytics_session_id') || (() => {
                        const id = Math.random().toString(36).substring(2, 15);
                        sessionStorage.setItem('analytics_session_id', id);
                        return id;
                    })(),
                });

                if (error) console.error('Supabase Analytics Error:', error);
            } catch (error) {
                console.warn('Analytics tracking skipped or failed:', error);
            }
        };

        // Pequeno delay para garantir que a página carregou e não contar redirects rápidos demais
        const timer = setTimeout(trackView, 1000);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return null;
};

export default AnalyticsTracker;
