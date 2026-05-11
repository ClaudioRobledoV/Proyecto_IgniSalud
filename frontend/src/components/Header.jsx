import React from 'react';
import { User as UserIcon } from 'lucide-react';

const Header = ({ user }) => {
  return (
    <header className="main-header">
      <div className="header-search">
        <input type="text" placeholder="Buscar citas, médicos..." />
      </div>
      <div className="user-profile">
        <div className="user-info">
          <span className="user-name">
            {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Usuario'}
          </span>
          <span className="user-role">
            {user?.role === 'PATIENT' ? 'Paciente' : user?.role === 'ADMIN' ? 'Administrador' : 'Médico'}
          </span>
        </div>
        <div className="user-avatar">
          <UserIcon size={24} />
        </div>
      </div>
    </header>
  );
};

export default Header;
