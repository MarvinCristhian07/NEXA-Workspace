import { Outlet } from 'react-router-dom';

export function AuthLayout() {
    return (
        <div style={{ minHeight: '100vh', background: '#F5F6FA' }}>
            <Outlet />
        </div>
    );
}