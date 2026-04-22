import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import DashboardView from './pages/DashboardView';
import Login from './pages/Login';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router> {/* 🔥 AGORA É HASHROUTER */}
        <div className="App">
          <Routes>

            <Route path="/login" element={<Login />} />

            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/dashboard/:id" 
              element={
                <PrivateRoute>
                  <DashboardView />
                </PrivateRoute>
              } 
            />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;