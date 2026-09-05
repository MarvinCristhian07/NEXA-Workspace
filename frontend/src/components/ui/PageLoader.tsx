/**
 * Loader de transição entre rotas
 * Aparece durante o lazy loading das páginas
 */
export function PageLoader() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F5F6FA',
                zIndex: 9999,
            }}
        >
            <div style={{ textAlign: 'center' }}>
                {/* Logo animado */}
                <div
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#3D5FA8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            stroke="#19C4E0"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div
                    style={{
                        width: '120px',
                        height: '3px',
                        background: '#EEf1F8',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        margin: '0 auto',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            background: '#3D5FA8',
                            borderRadius: '2px',
                            animation: 'loading 1.2s ease-in-out infinite',
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: .8; transform: scale(.95); }
                }
                @keyframes loading {
                    0% { width: 0%; margin-left: 0; }
                    50% { width: 70%; margin-left: 15%; }
                    100% { width: 0%; margin-left: 100%; }
                }
            `}</style>
        </div>    
    );
}