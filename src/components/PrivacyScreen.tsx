export function PrivacyScreen() {
  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          🔒 Politika e Privatësisë
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
            Privatësia Juaj është e Rëndësishme
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            "Ora e Barnave" është ndërtuar me privatësinë tuaj në mendje. Ky dokument shpjegon se si aplikacioni trajton të dhënat tuaja.
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4CAF50' }}>
            ✅ Çfarë Ruajmë
          </h3>
          <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>Listën e barnave tuaja</li>
            <li>Historinë e marrjes së barnave</li>
            <li>Matjet e sheqerit në gjak (nëse shtoni)</li>
            <li>Raportet mjekësore (nëse ngarkoni)</li>
            <li>Kontaktet urgjente (nëse shtoni)</li>
            <li>Cilësimet e aplikacionit</li>
          </ul>
        </div>

        <div className="card" style={{ background: '#E8F5E9' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#388E3C' }}>
            🔐 Ku Ruhen Të Dhënat
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <strong>TË GJITHA të dhënat ruhen VETËM në pajisjen tuaj.</strong>
          </p>
          <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>✅ Asnjë të dhënë nuk dërgohet në servera të jashtëm</li>
            <li>✅ Asnjë të dhënë nuk ndahet me palë të treta</li>
            <li>✅ Aplikacioni funksionon plotësisht offline</li>
            <li>✅ Vetëm JU keni qasje në të dhënat tuaja</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            📱 Njoftimet
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Nëse aktivizoni njoftimet, aplikacioni do të dërgojë kujtesa lokale në pajisjen tuaj për orarin e barnave. Këto njoftime krijohen në pajisjen tuaj dhe NUK kalojnë nëpër asnjë server të jashtëm.
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            💾 Backup dhe Eksporti
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Kur eksportoni të dhënat (backup), ato ruhen si skedar në pajisjen tuaj. Ju vendosni se ku të ruani këtë skedar dhe me kë ta ndani (p.sh. me familjarët ose mjekun).
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            🍪 Cookies dhe Tracking
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            <strong>NUK përdorim:</strong>
          </p>
          <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>❌ Cookies</li>
            <li>❌ Analytics</li>
            <li>❌ Tracking të palëve të treta</li>
            <li>❌ Reklamime</li>
          </ul>
        </div>

        <div className="card" style={{ background: '#FFF3E0' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#F57C00' }}>
            ⚠️ KUJDES: Disclaimer Mjekësor
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <strong>Ky aplikacion NUK është një pajisje mjekësore.</strong>
          </p>
          <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>Është vetëm një kujtues personal</li>
            <li>NUK zëvendëson këshillën mjekësore profesionale</li>
            <li>NUK jep diagnoza ose këshilla mjekësore</li>
            <li>Gjithmonë konsultohuni me mjekun tuaj</li>
            <li>Në rast urgjence, telefononi 112</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            🔄 Ndryshime në Politikën e Privatësisë
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Nëse bëjmë ndryshime në këtë politikë privatësie, do t'ju njoftojmë nëpërmjet aplikacionit. Përdorimi i vazhdueshëm i aplikacionit pas ndryshimeve do të konsiderohet si pranim i politikës së re.
          </p>
        </div>

        <div className="card" style={{ background: '#E3F2FD' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            📞 Kontakt
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Nëse keni pyetje rreth kësaj politike privatësie ose se si aplikacioni trajton të dhënat tuaja, ju lutem na kontaktoni.
          </p>
        </div>

        <div className="card" style={{ background: '#E8F5E9' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#388E3C' }}>
            ✅ Përmbledhje
          </h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.6 }}>
            Të dhënat tuaja janë TUAJAT. Ruhen vetëm në pajisjen tuaj. Askush tjetër nuk ka qasje. Asgjë nuk dërgohet në internet.
          </p>
        </div>

        <p style={{ fontSize: '1rem', color: '#666', textAlign: 'center', marginTop: '2rem' }}>
          Përditësuar më: Tetor 2024
        </p>

        {/* Version Info */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          padding: '1.5rem',
          borderTop: '2px solid #E0E0E0'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4CAF50', marginBottom: '0.5rem' }}>
            Versioni 1.1.1
          </div>
          <div style={{ fontSize: '0.9rem', color: '#999' }}>
            © 2024 Ora e Barnave - Aplikacion falas dhe i hapur
          </div>
        </div>
      </div>
    </div>
  );
}

