import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  X,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  User,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { AuthUser } from '../types';
import { apiService } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onUserChanged: (user: AuthUser | null) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onUserChanged
}: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setIsChangingPassword(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Por favor informe usuário e senha.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const user = await apiService.auth.login(username.trim(), password);
      onUserChanged(user);
      setSuccessMsg(`Autenticado com sucesso como ${user.name} (${user.role.toUpperCase()})!`);
      setUsername('');
      setPassword('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiService.auth.logout();
      onUserChanged(null);
      setSuccessMsg('Sessão encerrada com sucesso.');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao sair');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setErrorMsg('Preencha a senha atual e a nova senha.');
      return;
    }
    if (newPass.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await apiService.auth.changePassword(currentPass, newPass);
      setSuccessMsg('Senha atualizada com sucesso no banco de dados!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao alterar senha. Verifique a senha atual informada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Autenticação da Equipe
            </h2>
            <p className="text-xs text-slate-500">
              Acesso seguro para atletas e comissão técnica
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-2xl mb-4 text-xs text-blue-900 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-950">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            Sessão Criptografada e Segura:
          </div>
          <p className="text-[11px] text-blue-800">
            As senhas são verificadas com algoritmo scrypt resistente a timing no servidor. Sessões expiram após inatividade. Não compartilhe suas credenciais.
          </p>
        </div>

        {/* Current User Status if logged in */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentUser.avatar && currentUser.avatar.trim() ? (
                  <img
                    src={currentUser.avatar.trim()}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover object-top border-2 border-orange-400 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-sm">
                    {currentUser.nickname?.[0] || currentUser.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Papel: <b className="capitalize text-slate-700">{currentUser.role}</b>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 border border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>

            {/* Toggle Change Password Section */}
            {!isChangingPassword ? (
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 hover:underline"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Trocar Minha Senha
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                  Alteração de Senha
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Senha Atual:
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nova Senha (mínimo 6 caracteres):
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Confirmar Nova Senha:
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2 border border-red-200 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setErrorMsg('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome de Usuário:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário cadastrado"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Senha de Acesso:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2 border border-red-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {loading ? 'Validando no Servidor...' : 'Entrar no Sistema'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
