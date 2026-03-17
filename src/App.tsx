import { useEffect, useState, ReactNode, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { supabase } from "./lib/supabaseClient"; 
import { Loader2 } from "lucide-react";

// Lazy Loading de Páginas
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Agenda = lazy(() => import("./pages/Agenda"));
const FollowUp = lazy(() => import("./pages/FollowUp"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Patients = lazy(() => import("./pages/Patients"));
const PrePatients = lazy(() => import("./pages/PrePatients"));
const Convenios = lazy(() => import("./pages/Convenios"));
const DoctorsInsurance = lazy(() => import("./pages/DoctorsInsurance"));
const WhatsApp = lazy(() => import("./pages/WhatsApp"));
const Teleconsulta = lazy(() => import("./pages/Teleconsulta"));
const Connections = lazy(() => import("./pages/Connections"));
const Integration = lazy(() => import("./pages/Integration"));
const Users = lazy(() => import("./pages/Users"));
const DoctorSchedule = lazy(() => import("./pages/DoctorSchedule"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Register = lazy(() => import("./pages/Register"));
const ClinicInfo = lazy(() => import("./pages/ClinicInfo"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold tracking-tight">MedX</h2>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Removido o delay artificial de 500ms para melhorar a performance

        if (mounted) {
          if (session) {
            setSession(session);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
        {/* Adicionei o logo do MedX (Texto) pra ficar mais bonito enquanto carrega */}
        <h2 style={{ fontFamily: 'sans-serif', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>MedX</h2>
        <div style={{ width: '40px', height: '40px', border: '3px solid #3b82f6', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontFamily: 'sans-serif', fontSize: '12px', marginTop: '15px', opacity: 0.7 }}>Iniciando sistema...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  </BrowserRouter>
);

export default App;
