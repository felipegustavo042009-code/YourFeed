export const generateAvatar = (nome) => {
  const inicial = nome ? nome.charAt(0).toUpperCase() : '?';
  
  const cores = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  
  const index = nome ? nome.charCodeAt(0) % cores.length : 0;
  const cor = cores[index];
  
  return { inicial, cor };
};
