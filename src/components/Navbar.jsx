import { useContext } from 'react';
import { generateAvatar } from '../utils/avatar';
import { GlobalContext } from '../variaveisGlobais';
import logo from '../img/logoOrg.png';

// Componente de navegação superior
export default function Navbar({ usuario, abaAtiva, onMudarAba }) {
  // Gera avatar baseado no nome do usuário
  const { inicial, cor } = generateAvatar(usuario?.nome || '');
  const { idLocal, setId } = useContext(GlobalContext);

  // Lista de abas disponíveis
  const abas = [
    { id: 'salas', nome: 'Salas', icon: '' },
    { id: 'reservar', nome: 'Reservar', icon: '' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Linha principal (desktop) */}
        <div className="flex items-center justify-between h-16">
          
          {/* Lado esquerdo: Logo e abas */}
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-stone-800 flex items-center justify-center">
              <img className='w-10 h-10' src={logo} alt="Imagem do icone falso da empresa de gestão"/>
              Gestão Caju Hub
            </div>
            
            {/* Abas - visíveis apenas em desktop */}
            <div className="hidden md:flex gap-1">
              {abas.map(aba => (
                <button
                  key={aba.id}
                  onClick={() => onMudarAba(aba.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                    abaAtiva === aba.id
                      ? 'bg-amber-200 text-stone-800 shadow-md' // Aba ativa
                      : 'text-stone-600 hover:bg-yellow-100 hover:text-stone-800 hover:shadow-sm' // Aba inativa
                  }`}
                >
                  <span className="mr-2">{aba.icon}</span>
                  {aba.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Lado direito: Informações do usuário */}
          <div className="flex items-center gap-3">
            {/* Avatar clicável - leva para página do usuário */}
            <div 
              className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition duration-300 hover:shadow-lg hover:border-2 hover:border-stone-800"
              onClick={() => onMudarAba('usuario')} // Clica para ir para perfil
            >
              {inicial} {/* Letra inicial do nome */}
            </div>
            
            {/* Nome e tipo do usuário - visível apenas em telas maiores */}
            <div className="hidden sm:block">
              <div className="font-semibold text-stone-800">{usuario?.nome}</div>
              <div className="text-xs text-stone-500">{usuario?.tipo}</div>
            </div>
          </div>
        </div>

        {/* Abas para mobile - aparecem abaixo em telas pequenas */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto items-center justify-center">
          {abas.map(aba => (
            <button
              key={aba.id}
              onClick={() => onMudarAba(aba.id)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition duration-300 ${
                abaAtiva === aba.id
                  ? 'bg-amber-200 text-stone-800 shadow-md' // Aba ativa
                  : 'text-stone-600 hover:bg-yellow-100 hover:text-stone-800 hover:shadow-sm' // Aba inativa
              }`}
            >
              <span className="mr-1">{aba.icon}</span>
              {aba.nome}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}