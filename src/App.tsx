import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
// --- AQUI ESTÁ A CORREÇÃO BASEADA NO SEU PRINT ---
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

// --- O NOVO COMPONENTE "SEGURANÇA" ---
const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão atual ao carregar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Escuta mudanças (login/logout) em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // O "CALMANTE": Enquanto carrega, mostra isso e NÃO redireciona
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white', flexDirection: 'column', gap: '10px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Carregando MedX...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Se terminou de carregar e NÃO tem sessão, aí sim manda pro Login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se tem sessão, libera a entrada
  return <Outlet />;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* --- ROTAS PÚBLICAS (Qualquer um acessa) --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Redireciona a raiz para login ou dashboard */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* --- ROTAS PROTEGIDAS (Só entra com crachá) --- */}
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

      {/* Rota de Erro */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
