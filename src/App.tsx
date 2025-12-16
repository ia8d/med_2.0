import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient"; 

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import FollowUp from "./pages/FollowUp";
import Assistant from "./pages/Assistant";
import Patients from "./pages/Patients";
import PrePatients from "./pages/PrePatients";
import Convenios from "./pages/Convenios";
import DoctorsInsurance from "./pages/DoctorsInsurance";
import WhatsApp from "./pages/WhatsApp";
import Teleconsulta from "./pages/Teleconsulta";
import Connections from "./pages/Connections";
import Integration from "./pages/Integration";
import Users from "./pages/Users";
import DoctorSchedule from "./pages/DoctorSchedule";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ClinicInfo from "./pages/ClinicInfo";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// --- PROTEÇÃO INTELIGENTE ---
const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        // 1. AWAIT: Forçamos o código a esperar a leitura do cache antes de qualquer coisa
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted) {
          if (session) {
            setSession(session);
          }
          // 2. Só destravamos o loading AQUI, depois de ter certeza absoluta
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    // 3. O Escutador apenas atualiza a sessão se ela mudar, mas NÃO destrava o loading inicial
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // TELA DE CARREGAMENTO (Sala de Espera Obrigatória)
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '15px' }}></div>
        <p style={{ fontFamily: 'sans-serif', fontSize: '14px', opacity: 0.8 }}>Verificando credenciais...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Se passou pelo loading e a sessão continua vazia, aí sim redireciona
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/follow-up" element={<FollowUp />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/pre-patients" element={<PrePatients />} />
        <Route path="/convenios" element={<Convenios />} />
        <Route path="/doctors-insurance" element={<DoctorsInsurance />} />
        <Route path="/whatsapp" element={<WhatsApp />} />
        <Route path="/teleconsulta" element={<Teleconsulta />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/integration" element={<Integration />} />
        <Route path="/clinic-info" element={<ClinicInfo />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:doctorId/schedule" element={<DoctorSchedule />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
