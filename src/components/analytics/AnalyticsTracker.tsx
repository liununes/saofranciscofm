import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabaseAdmin } from '@/integrations/supabase/client';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackView = async () => {
            try {
                const alreadyTracked = sessionStorage.getItem('analytics_tracked');
                if (alreadyTracked) return;

                const sessionId = sessionStorage.getItem('analytics_session_id') || (() => {
                    const id = Math.random().toString(36).substring(2, 15);
                    sessionStorage.setItem('analytics_session_id', id);
                    return id;
                })();

                const { error } = await supabaseAdmin.from('page_views').insert({
                    path: location.pathname + location.hash,
                    user_agent: navigator.userAgent,
                    session_id: sessionId,
                });

                if (!error) sessionStorage.setItem('analytics_tracked', '1');
            } catch {
                // silently skip
            }
        };

        const timer = setTimeout(trackView, 1000);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return null;
};

export default AnalyticsTracker;
