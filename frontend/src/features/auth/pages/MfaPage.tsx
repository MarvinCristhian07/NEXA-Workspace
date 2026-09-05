import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../router/paths';

export function MfaPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E2440', marginBottom: '8px' }}>MFA</h1>
        <p style={{ color: '#515A77', marginBottom: '24px', fontSize: '14px' }}>Rota /auth/mfa funcionando ✅</p>
        <button
          onClick={() => navigate(PATHS.DASHBOARD)}
          style={{ padding: '10px 20px', background: '#3D5FA8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
        >
          Ir para Dashboard →
        </button>
      </div>
    </div>
  );
}