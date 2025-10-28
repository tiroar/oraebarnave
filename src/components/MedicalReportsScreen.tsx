import { useState, useEffect } from 'react';
import { db, MedicalReport } from '../db/database';
import { builtInReports } from '../data/builtInReports';
import { formatDateAlbanian } from '../utils/dateHelpers';

export function MedicalReportsScreen() {
  const [activeTab, setActiveTab] = useState<'raportet' | 'analizat' | 'all'>('all');
  const [uploadedReports, setUploadedReports] = useState<MedicalReport[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadUploadedReports();
  }, []);

  const loadUploadedReports = async () => {
    const reports = await db.medicalReports.toArray();
    setUploadedReports(reports);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Skedari është shumë i madh! Maksimumi: 5MB');
        setIsUploading(false);
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        
        const title = prompt('Titulli i raportit:', `Raport - ${new Date().toLocaleDateString('sq-AL')}`);
        if (!title) {
          setIsUploading(false);
          return;
        }

        const category = confirm('A është ky një raport mjekësor?\n\nOK = Raport Mjekësor\nAnullo = Analizë') 
          ? 'raportet' 
          : 'analizat';

        await db.medicalReports.add({
          title,
          category,
          date: new Date().toISOString().split('T')[0],
          fileData,
          fileName: file.name,
          fileType: file.type,
          isBuiltIn: false,
          uploadedAt: new Date().toISOString()
        });

        await loadUploadedReports();
        setIsUploading(false);
        alert('✅ Raporti u ngarkua me sukses!');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('❌ Gabim gjatë ngarkimit!');
      setIsUploading(false);
    }
  };

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event);
  };

  const deleteReport = async (id: number) => {
    if (confirm('A jeni të sigurt që doni ta fshini këtë raport?')) {
      await db.medicalReports.delete(id);
      await loadUploadedReports();
    }
  };

  const openImage = (path: string, title: string) => {
    setSelectedImage(path);
    setSelectedTitle(title);
  };

  const closeImage = () => {
    setSelectedImage(null);
    setSelectedTitle('');
  };

  // Combine built-in and uploaded reports
  type CombinedReport = {
    title: string;
    category: string;
    date: string;
    path: string;
    isBuiltIn: boolean;
    id?: number;
  };

  const allReports: CombinedReport[] = [
    ...builtInReports.map(r => ({
      title: r.title,
      category: r.category,
      date: r.date,
      path: r.path,
      isBuiltIn: true
    })),
    ...uploadedReports.map(r => ({
      title: r.title,
      category: r.category || 'raportet',
      date: r.date,
      path: r.fileData || '',
      isBuiltIn: false,
      id: r.id
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredReports = activeTab === 'all' 
    ? allReports 
    : allReports.filter(r => r.category === activeTab);

  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          🏥 Raportet Mjekësore
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* Upload buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <label style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
            <div className="btn-primary" style={{ 
              textAlign: 'center',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.6 : 1
            }}>
              📁 Ngarko nga Skedari
            </div>
          </label>

          <label style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
            <div className="btn-primary" style={{ 
              textAlign: 'center',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.6 : 1,
              background: '#2196F3'
            }}>
              📸 Bëj Foto
            </div>
          </label>
        </div>

        {isUploading && (
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            marginTop: '1rem',
            background: '#E3F2FD',
            borderRadius: '12px',
            fontSize: '1.25rem'
          }}>
            ⏳ Duke ngarkuar...
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '1.5rem',
          overflowX: 'auto'
        }}>
          <button
            className={activeTab === 'all' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('all')}
            style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
          >
            📋 Të Gjitha ({allReports.length})
          </button>
          <button
            className={activeTab === 'raportet' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('raportet')}
            style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
          >
            🏥 Raportet ({allReports.filter(r => r.category === 'raportet').length})
          </button>
          <button
            className={activeTab === 'analizat' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('analizat')}
            style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
          >
            📊 Analizat ({allReports.filter(r => r.category === 'analizat').length})
          </button>
        </div>

        {/* Reports grid */}
        {filteredReports.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <p>Nuk ka raporte</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            {filteredReports.map((report, idx) => (
              <div
                key={`${report.isBuiltIn ? 'built' : 'uploaded'}-${idx}`}
                className="card"
                style={{
                  cursor: 'pointer',
                  padding: '0',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                onClick={() => openImage(report.path, report.title)}
              >
                <div style={{
                  width: '100%',
                  height: '150px',
                  backgroundImage: `url(${report.path})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: report.category === 'raportet' ? '#FF5252' : '#2196F3',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}>
                    {report.category === 'raportet' ? '🏥' : '📊'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ 
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                    wordWrap: 'break-word'
                  }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    📅 {formatDateAlbanian(new Date(report.date))}
                  </div>
                </div>
                {!report.isBuiltIn && report.id && (
                  <button
                    className="btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (report.id) {
                        deleteReport(report.id);
                      }
                    }}
                    style={{
                      margin: '0 0.75rem 0.75rem',
                      padding: '0.5rem',
                      fontSize: '0.9rem',
                      background: '#FFEBEE',
                      color: '#C62828',
                      border: '1px solid #C62828'
                    }}
                  >
                    🗑️ Fshi
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full screen image viewer */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={closeImage}
        >
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 600,
            textAlign: 'center',
            wordWrap: 'break-word'
          }}>
            {selectedTitle}
          </div>
          <button
            onClick={closeImage}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: '#FF5252',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt={selectedTitle}
            style={{
              maxWidth: '100%',
              maxHeight: '85vh',
              objectFit: 'contain',
              marginTop: '3rem'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{
            color: 'white',
            marginTop: '1rem',
            fontSize: '1rem',
            opacity: 0.8
          }}>
            👆 Zmadhoni me dy gishta • Klikoni jashtë për të mbyllur
          </div>
        </div>
      )}
    </div>
  );
}

