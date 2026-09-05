import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { PATHS } from '../../../router/paths';

export function DashboardPage() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E2440', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#515A77', marginBottom: '24px', fontSize: '14px' }}>Rota /dashboard funcionando ✅ · Rota protegida (AuthGuard)</p>
        <button
          onClick={() => { clearAuth(); navigate(PATHS.LOGIN); }}
          style={{ padding: '10px 20px', background: '#D93020', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
        >
          Logout →
        </button>
      </div>
    </div>
  );
}