export default function Home({ onEntrar, onVerSalas }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Sistema de Reservas
            </h1>
            <p className="text-lg text-gray-600">
              Gerencie salas, eventos e reservas de forma simples e eficiente
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onEntrar}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-md"
            >
              Entrar
            </button>
            <button
              onClick={onVerSalas}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-md"
            >
              Ver Salas sem Login
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-800 mb-2">Reservas Fáceis</h3>
              <p className="text-gray-600 text-sm">
                Faça reservas de salas e espaços com apenas alguns cliques
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-purple-600 text-3xl mb-3">🏢</div>
              <h3 className="font-semibold text-gray-800 mb-2">Gestão Completa</h3>
              <p className="text-gray-600 text-sm">
                Visualize disponibilidade e gerencie ocupações em tempo real
              </p>
            </div>
            
            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="text-pink-600 text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-800 mb-2">Controle de Acesso</h3>
              <p className="text-gray-600 text-sm">
                Sistema com diferentes níveis de permissão para usuários
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
