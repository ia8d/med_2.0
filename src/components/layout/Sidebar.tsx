import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  Users, 
  MessageCircle, 
  Video, 
  Plug,
  Settings,
  LogOut,
  Building2,
  FileSpreadsheet,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: BarChart3, 
      label: 'Métricas', 
      roles: ['owner'] 
    },
    { 
      path: '/agenda', 
      icon: Calendar, 
      label: 'Agenda', 
      roles: ['owner', 'doctor', 'secretary'] 
    },
    { 
      path: '/follow-up', 
      icon: ClipboardList, 
      label: 'Follow Up', 
      roles: ['owner', 'secretary'] 
    },
    { 
      path: '/assistant', 
      icon: MessageSquare, 
      label: 'Assistente', 
      roles: ['owner', 'doctor', 'secretary'] 
    },
    {
      icon: Users,
      label: 'Pacientes',
      roles: ['owner', 'doctor', 'secretary'],
      children: [
        { path: '/patients', label: 'Pacientes CRM' },
        { path: '/pre-patients', label: 'Pré Pacientes' }
      ]
    },
    { 
      path: '/convenios', 
      icon: Building2, 
      label: 'Convênios', 
      roles: ['doctor'] 
    },
    { 
      path: '/doctors-insurance', 
      icon: FileSpreadsheet, 
      label: 'Visão de Convênios', 
      roles: ['owner', 'secretary'] 
    },
    { 
      path: '/whatsapp', 
      icon: MessageCircle, 
      label: 'WhatsApp', 
      roles: ['owner', 'secretary'] 
    },
    { 
      path: '/teleconsulta', 
      icon: Video, 
      label: 'Teleconsulta', 
      roles: ['owner', 'doctor'] 
    },
    { 
      path: '/integration', 
      icon: Plug, 
      label: 'Integração', 
      roles: ['owner'] 
    },
    { 
      path: '/clinic-info', 
      icon: Settings, 
      label: 'Informações da Clínica', 
      roles: ['owner'] 
    },
    { 
      path: '/users', 
      icon: UserCircle, 
      label: 'Usuários', 
      roles: ['owner'] 
    },
    { 
      path: '/profile', 
      icon: UserCircle, 
      label: 'Meu Perfil', 
      roles: ['owner', 'doctor', 'secretary'] 
    },
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={cn(
      "h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col transition-all duration-300 relative group",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 bg-primary text-primary-foreground rounded-full p-2 shadow-2xl z-[60] border-2 border-background hover:scale-110 hover:bg-primary/90 active:scale-95 transition-all duration-200"
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className={cn(
        "flex items-center justify-center flex-shrink-0 transition-all duration-300",
        isCollapsed ? "p-4" : "p-6"
      )}>
        <img 
          src="/logo-interno.png" 
          alt="MedX" 
          className={cn(
            "object-contain transition-all duration-300",
            isCollapsed ? "w-10 h-10" : "w-32 h-32"
          )} 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {visibleItems.map((item) => (
          item.children ? (
            <div key={item.label} className="space-y-1">
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground cursor-default",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <div className="ml-6 space-y-1">
                  {item.children.map((child: any) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/90 hover:bg-sidebar-accent/50'
                        )
                      }
                    >
                      <span className="text-xs font-medium">{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isCollapsed && "justify-center px-0",
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          )
        ))}
      </nav>

      {/* User Info */}
      <div className={cn(
        "p-4 border-t border-sidebar-border flex-shrink-0 transition-all duration-300",
        isCollapsed && "px-2"
      )}>
        <NavLink 
          to="/profile" 
          className={cn(
            "flex items-center gap-3 hover:bg-sidebar-accent/50 rounded-lg p-2 transition-colors",
            isCollapsed && "justify-center p-1"
          )}
          title={isCollapsed ? user?.name : undefined}
        >
          <Avatar className={cn("transition-all", isCollapsed ? "w-8 h-8" : "w-10 h-10")}>
            <AvatarImage src={user?.avatar_url} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name ?? ''}</p>
              <p className="text-xs text-sidebar-foreground/70 capitalize truncate">{user?.role ?? ''}</p>
            </div>
          )}
        </NavLink>
      </div>

      {/* Logout */}
      <div className={cn(
        "p-4 border-t border-sidebar-border flex-shrink-0 space-y-2",
        isCollapsed && "px-2"
      )}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50",
            isCollapsed && "justify-center p-0"
          )}
          onClick={handleLogout}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </Button>
      </div>
    </div>
  );
};
