import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Mail, Lock, User, Shield, X } from 'lucide-react';

// Pure helper function defined outside render to satisfy react-hooks/purity linter
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const Auth = () => {
  const { data, setCurrentUser, registerWorker, verifyWorker } = useTaskContext();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [view, setView] = useState('auth'); // 'auth' | 'verify'

  // Input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('trabajador'); // 'trabajador' | 'responsable'

  // Verification states
  const [verEmail, setVerEmail] = useState('');
  const [verName, setVerName] = useState('');
  const [verPassword, setVerPassword] = useState('');
  const [verRole, setVerRole] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Error/Success alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Simulated Email Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastCode, setToastCode] = useState('');

  // Auto-hide email toast after 8 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Generate 6 digit code and trigger simulated email toast
  const sendSimulatedEmail = (email, name, code) => {
    setToastCode(code);
    setShowToast(false);
    setTimeout(() => {
      setShowToast(true);
    }, 1500);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      return setErrorMsg('Por favor rellene todos los campos');
    }

    const worker = data.workers?.find(w => w.email?.toLowerCase() === loginEmail.trim().toLowerCase());
    
    if (!worker || worker.password !== loginPassword) {
      return setErrorMsg('Correo electrónico o contraseña incorrectos');
    }

    if (!worker.isVerified) {
      // User registered but never verified. Redirect to verification!
      const verificationCode = generateVerificationCode();
      setGeneratedCode(verificationCode);
      setVerEmail(worker.email);
      setVerName(worker.name);
      setView('verify');
      sendSimulatedEmail(worker.email, worker.name, verificationCode);
      return;
    }

    // Success login!
    setSuccessMsg('¡Inicio de sesión exitoso!');
    setTimeout(() => {
      setCurrentUser(worker.name);
    }, 800);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword) {
      return setErrorMsg('Por favor rellene todos los campos');
    }

    if (regPassword.length < 4) {
      return setErrorMsg('La contraseña debe tener al menos 4 caracteres');
    }

    // Check if worker already exists
    const emailExists = data.workers?.some(w => w.email?.toLowerCase() === regEmail.trim().toLowerCase());
    const nameExists = data.workers?.some(w => w.name?.toLowerCase() === regName.trim().toLowerCase());

    if (emailExists) {
      return setErrorMsg('Este correo electrónico ya está registrado');
    }

    if (nameExists) {
      return setErrorMsg('Este nombre de usuario ya está registrado');
    }

    // Generate 6 digit verification code
    const verificationCode = generateVerificationCode();
    setGeneratedCode(verificationCode);
    setVerEmail(regEmail);
    setVerName(regName);
    setVerPassword(regPassword);
    setVerRole(regRole);

    // Switch view to verification code inputs
    setView('verify');
    setPin(['', '', '', '', '', '']);

    // Send the simulated email
    sendSimulatedEmail(regEmail, regName, verificationCode);
  };

  // Handle individual digit input inside PIN verification
  const handlePinChange = (index, value) => {
    if (isNaN(value)) return; // Only allow numbers

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only keep the last digit
    setPin(newPin);

    // Auto-focus next field
    if (value && index < 5) {
      pinRefs[index + 1].current.focus();
    }
  };

  // Backspace support to jump to previous digit
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current.focus();
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const enteredCode = pin.join('');
    if (enteredCode.length < 6) {
      return setErrorMsg('Por favor complete los 6 dígitos del código');
    }

    if (enteredCode !== generatedCode) {
      return setErrorMsg('Código de verificación incorrecto. Inténtelo de nuevo.');
    }

    // Success verification!
    setSuccessMsg('¡Correo verificado con éxito!');
    
    // Check if user is already in list (unverified from previous login attempt)
    const existingWorker = data.workers?.find(w => w.email?.toLowerCase() === verEmail.trim().toLowerCase());

    setTimeout(() => {
      if (existingWorker) {
        verifyWorker(verEmail);
        setCurrentUser(existingWorker.name);
      } else {
        // Register new worker in global state as verified
        registerWorker(verName, verEmail, verPassword, verRole);
        // Set context as verified
        verifyWorker(verEmail);
        setCurrentUser(verName);
      }
    }, 1000);
  };

  const handleResendCode = () => {
    setErrorMsg('');
    const newCode = generateVerificationCode();
    setGeneratedCode(newCode);
    setPin(['', '', '', '', '', '']);
    pinRefs[0].current.focus();
    sendSimulatedEmail(verEmail, verName, newCode);
    setSuccessMsg('Código reenviado con éxito');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  return (
    <div className="auth-screen">
      
      {/* 1. AUTH CARD (LOGIN / REGISTER / VERIFY) */}
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">K</div>
          <h2 className="auth-title">KanbanPro</h2>
          <p className="auth-subtitle">
            {view === 'verify' 
              ? 'Verificación de Correo Obligatoria' 
              : activeTab === 'login' 
                ? 'Inicie sesión en su espacio de trabajo' 
                : 'Cree una cuenta para comenzar'}
          </p>
        </div>

        {/* Tab Selector (only visible in Auth view) */}
        {view === 'auth' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Global Alert Messages */}
        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: 'rgba(186, 26, 26, 0.08)',
            border: '1px solid var(--md-sys-color-error)',
            color: 'var(--badge-red-color)',
            fontSize: '0.8125rem',
            marginBottom: 20,
            fontWeight: 500,
            animation: 'fadeIn 0.2s'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: 'rgba(52, 168, 83, 0.08)',
            border: '1px solid var(--badge-green-color)',
            color: 'var(--badge-green-color)',
            fontSize: '0.8125rem',
            marginBottom: 20,
            fontWeight: 500,
            animation: 'fadeIn 0.2s'
          }}>
            ✓ {successMsg}
          </div>
        )}

        {/* VIEW A: AUTH VIEW */}
        {view === 'auth' ? (
          activeTab === 'login' ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label" style={{ paddingLeft: 4 }}>Correo Electrónico</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 16, color: 'var(--md-sys-color-on-surface-variant)' }} />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="input-field"
                    style={{ paddingLeft: 44 }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ paddingLeft: 4 }}>Contraseña</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 16, color: 'var(--md-sys-color-on-surface-variant)' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    style={{ paddingLeft: 44 }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', height: 44, marginTop: 12, borderRadius: 8, fontSize: '0.9375rem' }}
              >
                Iniciar Sesión
              </button>
            </form>
          ) : (
            /* --- REGISTER FORM --- */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label" style={{ paddingLeft: 4 }}>Nombre Completo</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: 16, color: 'var(--md-sys-color-on-surface-variant)' }} />
                  <input
                    type="text"
                    placeholder="Nombre y Apellidos"
                    className="input-field"
                    style={{ paddingLeft: 44 }}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ paddingLeft: 4 }}>Correo Electrónico</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 16, color: 'var(--md-sys-color-on-surface-variant)' }} />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="input-field"
                    style={{ paddingLeft: 44 }}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ paddingLeft: 4 }}>Contraseña</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 16, color: 'var(--md-sys-color-on-surface-variant)' }} />
                  <input
                    type="password"
                    placeholder="Mínimo 4 caracteres"
                    className="input-field"
                    style={{ paddingLeft: 44 }}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ paddingLeft: 4 }}>Rol del Usuario</label>
                <div className="role-selector-group">
                  <button
                    type="button"
                    className={`role-card-btn ${regRole === 'trabajador' ? 'active' : ''}`}
                    onClick={() => setRegRole('trabajador')}
                  >
                    <User size={20} />
                    <span className="role-card-title">Trabajador</span>
                    <span className="role-card-desc">Crea y avanza tareas en el tablero</span>
                  </button>
                  <button
                    type="button"
                    className={`role-card-btn ${regRole === 'responsable' ? 'active' : ''}`}
                    onClick={() => setRegRole('responsable')}
                  >
                    <Shield size={20} />
                    <span className="role-card-title">Responsable</span>
                    <span className="role-card-desc">Asigna, supervisa y aprueba tareas</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', height: 44, marginTop: 8, borderRadius: 8, fontSize: '0.9375rem' }}
              >
                Registrarse
              </button>
            </form>
          )
        ) : (
          /* --- VIEW B: PIN VERIFICATION FORM --- */
          <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              textAlign: 'center',
              lineHeight: 1.5,
              marginBottom: 12
            }}>
              Hemos enviado un código temporal a su cuenta:<br />
              <strong style={{ color: 'var(--md-sys-color-primary)' }}>{verEmail}</strong>
            </p>

            {/* Verification Inputs */}
            <div className="pin-inputs">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={pinRefs[index]}
                  type="text"
                  maxLength={1}
                  className="pin-input-field"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: 44, borderRadius: 8, fontSize: '0.9375rem', fontWeight: 600 }}
            >
              Verificar Código
            </button>

            <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ height: 32, padding: '0 12px', fontSize: '0.75rem', borderRadius: 6 }}
                onClick={() => { setView('auth'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Atrás
              </button>
              <button
                type="button"
                className="btn-icon"
                style={{ width: 'auto', height: 32, padding: '0 12px', fontSize: '0.75rem', borderRadius: 6, color: 'var(--md-sys-color-primary)', fontWeight: 500 }}
                onClick={handleResendCode}
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. FLOATING EMAIL SIMULATED TOAST */}
      {showToast && (
        <div className="email-sim-toast">
          <div className="email-sim-icon-box">
            <Mail size={20} />
          </div>
          <div className="email-sim-content">
            <div className="email-sim-header">
              <span className="email-sim-sender">KanbanPro Security</span>
              <span className="email-sim-time">Ahora mismo</span>
            </div>
            <h4 className="email-sim-subject">🔑 Código de Verificación de Registro</h4>
            <p className="email-sim-body">
              Hola <strong>{verName}</strong>, utiliza el siguiente código de un solo uso para verificar tu correo e iniciar tu espacio de trabajo:
            </p>
            <div className="email-sim-code-badge">
              {toastCode}
            </div>
          </div>
          <button 
            type="button" 
            className="email-sim-close-btn"
            onClick={() => setShowToast(false)}
            title="Cerrar notificación"
          >
            <X size={14} />
          </button>
          
          {/* Progress Shrinking Bar */}
          <div className="email-sim-progress" />
        </div>
      )}

    </div>
  );
};

export default Auth;
