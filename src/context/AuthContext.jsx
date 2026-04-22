import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../SupabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(undefined); // 🔥 começa como undefined
  const [loading, setLoading] = useState(true);

  // 🔎 Busca a role do usuário
  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        setUserRole(null);
        return;
      }

      setUserRole(data.role);
    } catch (err) {
      console.error('Erro inesperado no perfil:', err);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erro ao pegar sessão:', error);
        }

        const session = data?.session;

        if (session) {
          setUser(session.user);
          getProfile(session.user.id); // 🔥 sem await
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error('Erro geral:', err);
      } finally {
        setLoading(false); // nunca trava
      }
    };

    init();

    // 👂 Listener de login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        try {
          if (session) {
            setUser(session.user);
            getProfile(session.user.id); // 🔥 sem await
          } else {
            setUser(null);
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

  // 🔐 Login
  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  // 🚪 Logout
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, loading }}>
      {loading || userRole === undefined
        ? <div>Carregando...</div>
        : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);