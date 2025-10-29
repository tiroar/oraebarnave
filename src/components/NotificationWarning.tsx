import { useState } from 'react';

export function NotificationWarning() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('notificationWarningDismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('notificationWarningDismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      padding: '1.5rem',
      margin: '1.5rem',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'relative'
    }}>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(255,255,255,0.3)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>

      <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
        ⚠️
      </div>

      <h3 style={{
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        KUJDES: Si Funksionojnë Njoftimet
      </h3>

      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '1.5rem',
        borderRadius: '12px',
        fontSize: '1.15rem',
        lineHeight: 1.8,
        color: '#333'
      }}>
        <p style={{ marginBottom: '1rem', fontWeight: 600 }}>
          📱 <strong>RËNDËSISHME:</strong>
        </p>

        <p style={{ marginBottom: '1rem' }}>
          Për të marrë njoftime, aplikacioni duhet të jetë:
        </p>

        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>✅ I hapur në sfond</strong> (mos e mbyll plotësisht)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>✅ I instaluar në ekranin kryesor</strong>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>✅ Me bateri të optimizuar</strong> (mos e kufizo në cilësimet e baterisë)
          </li>
        </ul>

        <div style={{
          background: '#FFF3E0',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          borderLeft: '4px solid #FF9800'
        }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            💡 Këshillë:
          </p>
          <p style={{ fontSize: '1rem' }}>
            Nëse dëshironi njoftime të sigurta edhe kur telefoni është i mbyllur, përdorni 
            aplikacionin Android nga <strong>Google Play Store</strong> (në zhvillim).
          </p>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          marginTop: '1rem',
          width: '100%',
          background: 'white',
          color: '#F57C00',
          fontSize: '1.25rem',
          fontWeight: 600,
          padding: '1rem',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer'
        }}
      >
        E kuptova ✓
      </button>
    </div>
  );
}

