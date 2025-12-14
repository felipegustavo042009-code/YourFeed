import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Salas from './pages/Salas';
import Reservar from './pages/Reservar';
import Usuario from './pages/Usuario';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import { GlobalProvider } from "./variaveisGlobais";

function App() {
  const [tela, setTela] = useState('home');
  const [usuario, setUsuario] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (mensagem, tipo = 'info') => {
    setToast({ mensagem, tipo });
  };

  const handleLogin = (dadosUsuario) => {
    setUsuario(dadosUsuario);
    setTela('salas');
  };

  const handleLogout = () => {
    setUsuario(null);
    setTela('home');
    showToast('Logout realizado com sucesso!', 'success');
  };

  const handleEntrar = () => {
    setTela('login');
  };

  const handleVerSalas = () => {
    setTela('salas');
  };

  const handleVoltar = () => {
    setTela('home');
  };

  const handleMudarAba = (aba) => {
    setTela(aba);
  };

  return (
    <GlobalProvider>
      <div className="min-h-screen bg-gray-50">
        {toast && (
          <Toast
            mensagem={toast.mensagem}
            tipo={toast.tipo}
            onClose={() => setToast(null)}
          />
        )}
        {tela === 'home' && (
          <>
            <Home onEntrar={handleEntrar} onVerSalas={handleVerSalas} />
          </>
        )}
        {tela === 'login' && (
          <Login
            onLogin={handleLogin}
            onVoltar={handleVoltar}
            showToast={showToast}
          />
        )}
        {tela !== 'home' && usuario && (
          <Navbar
            usuario={usuario}
            abaAtiva={tela}
            onMudarAba={handleMudarAba}
          />
        )}

        {/* Conteúdo das telas quando usuário está logado */}
        {tela !== 'home' && usuario && (
          <>
            {tela === 'salas' && <Salas usuario={usuario} showToast={showToast} />}
            {tela === 'reservar' && <Reservar usuario={usuario} showToast={showToast} />}
            {tela === 'usuario' && <Usuario usuario={usuario} onLogout={handleLogout} showToast={showToast} />}
          </>
        )}
        {tela === 'salas' && !usuario && (
          <>
            <div className="bg-white shadow-md p-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-xl font-bold text-blue-600" style={{ color: "rgb(62, 42, 33)" }}>Sistema de Gerenciamento</div>
                <button
                  onClick={handleVoltar}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"style={{ backgroundColor: "rgb(244, 211, 94)",color: "rgb(62, 42, 33)"}}
                 >  
                Voltar
              </button>
            </div>
          </div>
        <Salas showToast={showToast} />
      </>
        )}
    </div>
    </GlobalProvider >
  );
}
// , "rgb(62, 42, 33)",
export default App;
