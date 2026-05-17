import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, User, Download, Filter, FileText } from 'lucide-react';
import adminService from '../services/adminService';

const GlobalAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, dateFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      const data = await adminService.getAllAppointments();
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (err) {
      setError('Error al cargar las citas globales.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        (apt.patient?.firstName + ' ' + apt.patient?.lastName).toLowerCase().includes(search) ||
        (apt.doctor?.firstName + ' ' + apt.doctor?.lastName).toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(apt => apt.date.startsWith(dateFilter));
    }

    setFilteredAppointments(filtered);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Fecha', 'Paciente', 'Médico', 'Estado', 'Motivo'];
    const rows = filteredAppointments.map(apt => [
      apt.id,
      new Date(apt.date).toLocaleDateString('es-CL'),
      `${apt.patient?.firstName} ${apt.patient?.lastName}`,
      `Dr. ${apt.doctor?.firstName} ${apt.doctor?.lastName}`,
      apt.status,
      apt.reason || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ignisalud_reporte_citas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="global-apt-container">
      <div className="global-apt-content animate-fade">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={20} />
          <span>Volver al Panel</span>
        </button>

        <header className="global-header">
          <div className="header-main">
            <h1>Citas Globales de la Clínica</h1>
            <button className="btn-export" onClick={exportToCSV}>
              <Download size={18} />
              Exportar reporte
            </button>
          </div>
          <p>Supervisión y control de todas las atenciones médicas realizadas en la plataforma.</p>
        </header>

        <div className="filters-grid">
          <div className="filter-item search">
            <label><Search size={14} /> Buscar Paciente o Médico</label>
            <input 
              type="text" 
              placeholder="Ej: Claudio Robledo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-item">
            <label><Filter size={14} /> Filtrar por Estado</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="COMPLETED">Completadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>

          <div className="filter-item">
            <label><Calendar size={14} /> Filtrar por Fecha</label>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Cargando todas las citas...</div>
        ) : (
          <div className="table-wrapper">
            <table className="global-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td className="date-cell">
                      {new Date(apt.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                    </td>
                    <td>
                      <div className="user-cell">
                        <User size={14} /> {apt.patient?.firstName} {apt.patient?.lastName}
                      </div>
                    </td>
                    <td>
                      <div className="user-cell doctor">
                        <User size={14} /> Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${apt.status.toLowerCase()}`}>
                        {apt.status === 'PENDING' ? 'Pendiente' : apt.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-view" title="Ver detalle">
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-row">No se encontraron citas con estos filtros.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .global-apt-container { min-height: 100vh; background: #F1F5F9; padding: 40px 20px; display: flex; justify-content: center; }
        .global-apt-content { width: 100%; max-width: 1200px; }
        
        .back-btn { display: flex; align-items: center; gap: 8px; background: none; color: #64748B; border: none; margin-bottom: 24px; cursor: pointer; transition: 0.3s; }
        .back-btn:hover { color: var(--primary); }

        .global-header { margin-bottom: 32px; }
        .header-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .global-header h1 { font-size: 32px; color: var(--secondary); margin: 0; }
        .global-header p { color: #64748B; margin: 0; }

        .btn-export { background: white; border: 1px solid #E2E8F0; color: var(--secondary); padding: 10px 20px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.3s; }
        .btn-export:hover { background: #F8FAFC; border-color: var(--primary); color: var(--primary); }

        .filters-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px; margin-bottom: 32px; }
        .filter-item { display: flex; flex-direction: column; gap: 8px; }
        .filter-item label { font-size: 13px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px; }
        .filter-item input, .filter-item select { padding: 12px 16px; border: 1px solid #E2E8F0; border-radius: 12px; font-family: inherit; font-size: 15px; outline: none; }
        .filter-item input:focus, .filter-item select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(38, 198, 218, 0.1); }

        .table-wrapper { background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-premium); }
        .global-table { width: 100%; border-collapse: collapse; text-align: left; }
        .global-table th { background: #F8FAFC; padding: 18px 24px; font-size: 13px; color: #64748B; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #F1F5F9; }
        .global-table td { padding: 18px 24px; border-bottom: 1px solid #F1F5F9; font-size: 15px; }
        
        .date-cell { font-weight: 700; color: var(--primary-dark); }
        .user-cell { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--secondary); }
        .user-cell.doctor { color: #6366F1; }

        .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .status-pill.pending { background: #FEF3C7; color: #92400E; }
        .status-pill.completed { background: #D1FAE5; color: #065F46; }
        .status-pill.cancelled { background: #FEE2E2; color: #991B1B; }

        .btn-view { background: #F8FAFC; border: none; padding: 8px; border-radius: 8px; color: #64748B; cursor: pointer; transition: 0.3s; }
        .btn-view:hover { background: #EEF2FF; color: #6366F1; }

        .loading-state, .empty-row { padding: 60px; text-align: center; color: #64748B; font-weight: 500; }
      `}} />
    </div>
  );
};

export default GlobalAppointments;
