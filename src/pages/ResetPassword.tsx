import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Radio, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    } else {
      // Also listen for PASSWORD_RECOVERY event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error('Erro ao alterar senha.');
    } else {
      toast.success('Senha alterada com sucesso!');
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="bg-card rounded-xl shadow-elevated p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Radio className="w-8 h-8 text-primary" />
          <h1 className="font-display font-bold text-xl text-foreground">Nova Senha</h1>
        </div>

        {!ready ? (
          <p className="text-sm text-muted-foreground text-center">Link de recuperação inválido ou expirado.</p>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label>Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirmar Senha</Label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
