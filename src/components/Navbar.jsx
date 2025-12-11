import { generateAvatar } from '../utils/avatar';

export default function Navbar({ usuario, abaAtiva, onMudarAba }) {
  const { inicial, cor } = generateAvatar(usuario?.nome || '');

  const abas = [
    { id: 'home', nome: 'Home', icon: '🏠' },
    { id: 'salas', nome: 'Salas', icon: '🏢' },
    { id: 'reservar', nome: 'Reservar', icon: '📅' },
    { id: 'usuario', nome: 'Usuário', icon: '👤' }
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-blue-600">Sistema de Reservas</div>
            <div className="hidden md:flex gap-1">
              {abas.map(aba => (
                <button
                  key={aba.id}
                  onClick={() => onMudarAba(aba.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                    abaAtiva === aba.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{aba.icon}</span>
                  {aba.nome}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${cor} rounded-full flex items-center justify-center text-white font-bold cursor-pointer`}
                 onClick={() => onMudarAba('usuario')}>
              {inicial}
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-gray-800">{usuario?.nome}</div>
              <div className="text-xs text-gray-500">{usuario?.tipo}</div>
            </div>
          </div>
        </div>
        
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {abas.map(aba => (
            <button
              key={aba.id}
              onClick={() => onMudarAba(aba.id)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition duration-300 ${
                abaAtiva === aba.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
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
