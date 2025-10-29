import { medicationInstructions } from '../data/medications';

export function InstructionsScreen() {
  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          📖 Udhëzime
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* General Instructions */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2>{medicationInstructions.title}</h2>
          
          {medicationInstructions.instructions.map((inst, idx) => (
            <div
              key={idx}
              style={{
                background: '#F5F5F5',
                padding: '1rem',
                borderRadius: '12px',
                marginTop: '1rem',
                borderLeft: '4px solid #2196F3'
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {inst.icon} {inst.title}
              </div>
              <div style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                {inst.text}
              </div>
            </div>
          ))}
        </div>

        {/* Hypoglycemia Guide */}
        <div className="card" style={{ background: '#FFEBEE', marginTop: '1.5rem' }}>
          <h2 style={{ color: '#C62828' }}>{medicationInstructions.hypoglycemia.title}</h2>
          
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            marginTop: '1rem',
            marginBottom: '1rem',
            color: '#C62828'
          }}>
            {medicationInstructions.hypoglycemia.symptoms}
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '12px',
            fontSize: '1.1rem',
            lineHeight: 1.8
          }}>
            <strong>Hapat për të ndjekur:</strong>
            {medicationInstructions.hypoglycemia.steps.map((step, idx) => (
              <div key={idx} style={{ marginTop: '0.5rem' }}>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reference - General Tips */}
        <div className="card" style={{ background: '#E3F2FD', marginTop: '1.5rem' }}>
          <h2>⚡ Këshilla të Përgjithshme</h2>
          
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '0.75rem' }}>
              💊 <strong>Merri barnat në të njëjtën orë çdo ditë</strong> për rezultate më të mira
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              🥤 <strong>Pi shumë ujë</strong> kur merr barnat (përveç nëse mjeku thotë ndryshe)
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              🍽️ <strong>Disa barna merren me ushqim,</strong> të tjerët pa ushqim - ndjek udhëzimet
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              ⏰ <strong>Mos i harro barnat</strong> - përdor aplikacionin për kujtesa
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              📞 <strong>Telefono mjekun</strong> nëse ke efekte anësore ose pyetje
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              🔄 <strong>Mos i ndalo barnat pa konsultuar mjekun,</strong> edhe nëse ndihesh mirë
            </div>
          </div>
        </div>

        {/* Emergency Button */}
        <button
          className="emergency-button"
          onClick={() => {
            if (confirm('Telefono 112?')) {
              window.location.href = 'tel:112';
            }
          }}
          style={{ marginTop: '2rem' }}
        >
          🚨 THIRRJE EMERGJENTE 112
        </button>
      </div>
    </div>
  );
}

