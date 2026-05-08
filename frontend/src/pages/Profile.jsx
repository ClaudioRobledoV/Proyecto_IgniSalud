import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Activity, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import patientService from '../services/patientService';
import doctorService from '../services/doctorService';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = authService.getCurrentUser();
    const isDoctor = currentUser?.role === 'DOCTOR';
    
    const [activeTab, setActiveTab] = useState('personal');
    
    // Form States
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',    // Nuevo
        phone: '',    // Nuevo
        address: '', // Solo Paciente
        age: '',     // Solo Paciente
        allergies: '', // Solo Paciente
        specialty: ''  // Solo Doctor
    });
    
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let data;
                if (isDoctor) {
                    data = await doctorService.getProfile();
                    setProfileData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        specialty: data.specialty || '',
                    });
                } else {
                    data = await patientService.getProfile();
                    setProfileData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        age: data.age || '',
                        allergies: data.allergies || ''
                    });
                }
                
                if (location.hash === '#health' && !isDoctor) setActiveTab('health');
                if (location.hash === '#security') setActiveTab('security');

            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'No se pudo cargar la información del perfil.' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [isDoctor, location.hash]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            if (isDoctor) {
                await doctorService.updateProfile({
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    specialty: profileData.specialty,
                    email: profileData.email,
                    phone: profileData.phone
                });
            } else {
                await patientService.updateProfile(profileData);
            }
            
            setMessage({ type: 'success', text: '¡Perfil actualizado exitosamente!' });
            
            // Actualizar local storage
            const user = authService.getCurrentUser();
            user.profile = { ...user.profile, ...profileData };
            localStorage.setItem('user', JSON.stringify(user));
            
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
        }

        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            await authService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: 'Contraseña cambiada con éxito.' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Error al cambiar la contraseña.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-screen">Cargando perfil...</div>;

    return (
        <div className="profile-page-container">
            <div className="profile-content animate-fade">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    <ArrowLeft size={18} />
                    <span>Volver al Dashboard</span>
                </button>

                <header className="profile-header">
                    <h1>Configuración: {isDoctor ? 'Médico' : 'Paciente'}</h1>
                    <p>Gestiona tu información {isDoctor ? 'profesional' : 'personal'} y seguridad.</p>
                </header>

                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <User size={18} /> {isDoctor ? 'Mis Datos' : 'Mis Datos'}
                    </button>
                    {!isDoctor && (
                        <button 
                            className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
                            onClick={() => setActiveTab('health')}
                        >
                            <Activity size={18} /> Ficha Médica
                        </button>
                    )}
                    <button 
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Lock size={18} /> Seguridad
                    </button>
                </div>

                <div className="tab-content-card">
                    {message.text && (
                        <div className={`message-banner ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <form onSubmit={handleUpdate} className="profile-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombres</label>
                                    <input 
                                        type="text" 
                                        value={profileData.firstName} 
                                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellidos</label>
                                    <input 
                                        type="text" 
                                        value={profileData.lastName} 
                                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        value={profileData.email} 
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono de Contacto</label>
                                    <input 
                                        type="tel" 
                                        value={profileData.phone} 
                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                        placeholder="+56 9 ..."
                                    />
                                </div>
                                
                                {isDoctor ? (
                                    <div className="form-group full-width">
                                        <label>Especialidad Médica</label>
                                        <input 
                                            type="text" 
                                            value={profileData.specialty} 
                                            onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="form-group full-width">
                                            <label>Dirección</label>
                                            <input 
                                                type="text" 
                                                value={profileData.address} 
                                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Edad</label>
                                            <input 
                                                type="number" 
                                                value={profileData.age} 
                                                onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <button type="submit" className="btn-save" disabled={submitting}>
                                <Save size={18} /> {submitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    )}

                    {!isDoctor && activeTab === 'health' && (
                        <form onSubmit={handleUpdate} className="profile-form">
                            <div className="form-group full-width">
                                <label>Alergias Conocidas</label>
                                <textarea 
                                    placeholder="Ej: Penicilina, mariscos..."
                                    value={profileData.allergies} 
                                    onChange={(e) => setProfileData({...profileData, allergies: e.target.value})}
                                    rows="4"
                                />
                            </div>
                            <button type="submit" className="btn-save" disabled={submitting}>
                                <Save size={18} /> {submitting ? 'Actualizar Ficha' : 'Actualizar Ficha'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handleChangePassword} className="profile-form">
                            <div className="form-group full-width">
                                <label>Contraseña Actual</label>
                                <input 
                                    type="password" 
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirmar Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-save" disabled={submitting}>
                                <Lock size={18} /> {submitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .profile-page-container {
                    min-height: 100vh;
                    background: #F1F5F9;
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                }

                .profile-content { width: 100%; max-width: 800px; }

                .back-btn {
                    display: flex; align-items: center; gap: 8px;
                    background: none; color: #64748B; border: none;
                    margin-bottom: 24px; cursor: pointer; transition: 0.3s;
                }
                .back-btn:hover { color: var(--primary); }

                .profile-header { margin-bottom: 32px; }
                .profile-header h1 { font-size: 32px; color: var(--secondary); margin-bottom: 8px; }
                .profile-header p { color: #64748B; }

                .profile-tabs { display: flex; gap: 12px; margin-bottom: 24px; }
                .tab-btn {
                    padding: 12px 24px; border: none; border-radius: 12px;
                    background: #E2E8F0; color: #64748B; font-weight: 600;
                    display: flex; align-items: center; gap: 8px;
                    cursor: pointer; transition: 0.3s;
                }
                .tab-btn.active {
                    background: var(--primary); color: white;
                    box-shadow: 0 4px 12px rgba(38, 198, 218, 0.3);
                }

                .tab-content-card {
                    background: white; padding: 40px; border-radius: 24px;
                    box-shadow: var(--shadow-premium);
                }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group.full-width { grid-column: span 2; }
                .form-group label { font-size: 14px; font-weight: 700; color: #475569; }
                .form-group input, .form-group textarea {
                    padding: 12px 16px; border: 2px solid #F1F5F9; border-radius: 12px;
                    background: #F8FAFC; font-size: 16px; transition: 0.3s;
                }
                .form-group input:focus, .form-group textarea:focus {
                    outline: none; border-color: var(--primary); background: white;
                }

                .btn-save {
                    margin-top: 32px; background: var(--secondary); color: white;
                    border: none; padding: 14px 28px; border-radius: 12px;
                    font-weight: 700; display: flex; align-items: center; gap: 10px;
                    cursor: pointer; transition: 0.3s;
                }
                .btn-save:hover { background: var(--primary); transform: translateY(-2px); }
                .btn-save:disabled { background: #CBD5E1; cursor: not-allowed; }

                .message-banner {
                    padding: 16px; border-radius: 12px; margin-bottom: 24px;
                    display: flex; align-items: center; gap: 12px; font-weight: 600;
                }
                .message-banner.success { background: #DCFCE7; color: #166534; }
                .message-banner.error { background: #FEE2E2; color: #991B1B; }

                .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--primary); }
            ` }} />
        </div>
    );
};

export default Profile;
