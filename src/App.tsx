import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
// Mantenha o import que já estava funcionando pra você:
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

// --- PROTECTED ROUTE CORRIGIDA ---
const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. A PEÇA QUE FALTAVA: Pergunta Ativa (Pega do Cache Imediatamente)
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session) {
            setSession(session);
          }
          // Nota: Não setamos loading false aqui ainda para dar chance ao listener confirmar
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkSession();

    // 2. Escuta mudanças (Listener)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false); // Só libera o carregamento aqui
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // TELA DE CARREGAMENTO (SALA DE ESPERA)
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0f172a', 
        color: 'white' 
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #3b82f6', 
          borderTop: '4px solid transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ fontFamily: 'sans-serif' }}>Carregando MedX...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Se acabou o loading e NÃO tem sessão, vai pro Login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se tem sessão, entra
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
