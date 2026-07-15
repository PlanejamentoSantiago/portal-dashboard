import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../SupabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(undefined); // começa como undefined
  const [loading, setLoading] = useState(true);

  // Busca o perfil (role, nome...) do usuário
  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        setUserRole(null);
        setProfile(null);
        return;
      }

      setProfile(data);
      setUserRole(data.role);
    } catch (err) {
      console.error('Erro inesperado no perfil:', err);
      setUserRole(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('Erro ao pegar sessão:', error);

        const session = data?.session;
        if (session) {
          setUser(session.user);
          getProfile(session.user.id);
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error('Erro geral:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        try {
          if (session) {
            setUser(session.user);
            getProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setUserRole(null);
          }
        } catch (err) {
          console.error('Erro no listener:', err);
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = String(userRole || '').trim().toLowerCase() === 'gerencia';

  return (
    <AuthContext.Provider
      value={{ user, profile, userRole, isAdmin, login, logout, loading }}
    >
      {loading || userRole === undefined ? (
        <div className="center-screen">
          <div className="spinner" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
