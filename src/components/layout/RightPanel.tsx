import { Search, MoreVertical } from 'lucide-react';

export function RightPanel() {
  const members = [
    { name: 'Ahmet Yılmaz', status: 'online' },
    { name: 'Ayşe Demir', status: 'online' },
    { name: 'Mehmet Kaya', status: 'idle' },
    { name: 'Zeynep Şahin', status: 'offline' },
    { name: 'Can Öztürk', status: 'online' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-pardus-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pardus-text/40" size={20} />
          <input
            type="text"
            placeholder="Üye ara..."
            className="w-full pl-10 pr-4 py-2 border border-pardus-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pardus-primary"
          />
        </div>
      </div>

      {/* Member list */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Üyeler ({members.length})</h3>
          <button className="text-pardus-text/70 hover:text-pardus-primary">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.name} className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-pardus-border flex items-center justify-center">
                  {member.name.charAt(0)}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    member.status === 'online'
                      ? 'bg-green-500'
                      : member.status === 'idle'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-pardus-text/70 capitalize">{member.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room info */}
      <div className="p-4 border-t border-pardus-border">
        <h4 className="font-bold mb-2">Oda Bilgileri</h4>
        <p className="text-sm text-pardus-text/70">
          Bu oda şifrelenmiş uçtan uca (E2EE) iletişim sağlar.
        </p>
        <div className="mt-3 text-xs text-pardus-primary font-medium">
          🔒 Güvenli iletişim aktif
        </div>
      </div>
    </div>
  );
}