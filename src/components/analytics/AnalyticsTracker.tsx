
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackView = async () => {
            try {
                // Verifica se já registrou este acesso nesta sessão do navegador
                const alreadyTracked = sessionStorage.getItem('analytics_tracked');
                if (alreadyTracked) return;

                const geoRes = await fetch('https://ipapi.co/json/').catch(() => null);
                const geoData = geoRes && geoRes.ok ? await geoRes.json() : {};
                const ip = geoData.ip || null;

                if (ip) {
                    // Verifica se já existe registro deste IP hoje
                    const today = new Date().toISOString().split('T')[0];
                    const { count } = await supabase
                        .from('page_views')
                        .select('id', { count: 'exact' })
                        .limit(1)
                        .eq('ip', ip)
                        .gte('created_at', `${today}T00:00:00.000Z`);

                    if (count && count > 0) {
                        sessionStorage.setItem('analytics_tracked', '1');
                        return;
                    }
                }

                const sessionId = sessionStorage.getItem('analytics_session_id') || (() => {
                    const id = Math.random().toString(36).substring(2, 15);
                    sessionStorage.setItem('analytics_session_id', id);
                    return id;
                })();

                const { error } = await supabase.from('page_views').insert({
                    path: location.pathname + location.hash,
                    user_agent: navigator.userAgent,
                    city: geoData.city || null,
                    region: geoData.region || null,
                    country: geoData.country_name || null,
                    ip,
                    session_id: sessionId,
                });

                if (error) console.error('Supabase Analytics Error:', error);
                else sessionStorage.setItem('analytics_tracked', '1');
            } catch (error) {
                console.warn('Analytics tracking skipped or failed:', error);
            }
        };

        const timer = setTimeout(trackView, 1000);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return null;
};

export default AnalyticsTracker;
