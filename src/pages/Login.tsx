import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Radio, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error('E-mail ou senha incorretos.');
    } else {
      navigate('/admin');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Informe seu e-mail.');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error('Erro ao enviar link de recuperação.');
    } else {
      toast.success('Link de recuperação enviado para seu e-mail!');
      setForgotMode(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="bg-card rounded-xl shadow-elevated p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Radio className="w-8 h-8 text-primary" />
          <h1 className="font-display font-bold text-xl text-foreground">Painel Admin</h1>
        </div>

        {forgotMode ? (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Informe seu e-mail para receber o link de recuperação.</p>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </Button>
            <button type="button" onClick={() => setForgotMode(false)} className="text-sm text-primary w-full text-center">
              Voltar ao login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-primary w-full text-center">
              Esqueci minha senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
