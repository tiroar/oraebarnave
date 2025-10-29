import { useState, useEffect } from 'react';
import { Medication } from '../data/medications';
import { shouldShowMedicationToday, getAllActiveMedications } from '../utils/medicationHelpers';

export function MedicationListScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const today = new Date();

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    const handleMedicationsUpdated = () => {
      loadMedications();
    };
    
    window.addEventListener('medicationsUpdated', handleMedicationsUpdated);
    return () => window.removeEventListener('medicationsUpdated', handleMedicationsUpdated);
  }, []);

  const loadMedications = async () => {
    const meds = await getAllActiveMedications();
    setMedications(meds);
  };
  
  // Group medications by meal time
  const mealGroups = {
    'morning': { title: '07:30 - PARA MËNGJESIT', meds: [] as typeof medications },
    'breakfast': { title: '08:00 - MËNGJESI', meds: [] as typeof medications },
    'lunch': { title: '13:00 - DREKA', meds: [] as typeof medications },
    'dinner': { title: '20:00 - DARKA', meds: [] as typeof medications },
    'bedtime': { title: '21:00 - PARA GJUMIT', meds: [] as typeof medications }
  };

  medications.forEach(med => {
    mealGroups[med.category].meds.push(med);
  });
  
  // Count medications for today
  const todaysMeds = medications.filter(med => shouldShowMedicationToday(med, today));
  const monthlyMeds = medications.filter(med => med.frequency === 'monthly');

  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          💊 Lista e Barnave
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        <div className="card" style={{ marginTop: '1.5rem', background: '#E3F2FD' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            📋 Të gjitha medikamentet
          </h2>
          <div style={{ fontSize: '1.1rem', textAlign: 'center', color: '#666', lineHeight: 1.8 }}>
            <div>📅 <strong>Sot:</strong> {todaysMeds.length} barna</div>
            <div>📆 <strong>Gjithsej në listë:</strong> {medications.length} barna</div>
            {monthlyMeds.length > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#E91E63', fontWeight: 600 }}>
                🔺 {monthlyMeds.length} barn merren vetëm 1 herë në muaj
              </div>
            )}
          </div>
        </div>

        {Object.entries(mealGroups).map(([key, group]) => {
          if (group.meds.length === 0) return null;

          return (
            <div key={key} style={{ marginTop: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                fontSize: '1.5rem',
                fontWeight: 700,
                textAlign: 'center'
              }}>
                ⏰ {group.title}
              </div>

              {group.meds.map((med) => {
                const isShowingToday = shouldShowMedicationToday(med, today);
                
                return (
                  <div
                    key={med.id}
                    className="card"
                    style={{
                      borderLeft: `6px solid ${med.color}`,
                      marginBottom: '1rem',
                      opacity: isShowingToday ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>
                        {med.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                          wordWrap: 'break-word',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          {med.name}
                          {med.frequency === 'monthly' && (
                            <span style={{
                              background: '#E91E63',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              MUJORE
                            </span>
                          )}
                          {!isShowingToday && (
                            <span style={{
                              background: '#9E9E9E',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              Jo sot
                            </span>
                          )}
                        </div>
                      
                      <div style={{
                        fontSize: '1.25rem',
                        color: '#666',
                        marginBottom: '0.75rem'
                      }}>
                        📦 <strong>Doza:</strong> {med.dose}
                      </div>

                      <div style={{
                        background: '#FFF9C4',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        marginBottom: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                      }}>
                        <strong>📝 Si merret:</strong><br />
                        {med.instructions}
                      </div>

                      {med.warning && (
                        <div style={{
                          background: '#FFEBEE',
                          color: '#C62828',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          fontWeight: 600,
                          borderLeft: '4px solid #C62828',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}>
                          {med.warning}
                        </div>
                      )}

                      {med.specialTimer && (
                        <div style={{
                          background: '#E3F2FD',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontSize: '1.1rem',
                          marginTop: '0.75rem',
                          fontWeight: 600,
                          color: '#1976D2'
                        }}>
                          ⏱️ Kohëmatës special: Qëndro në këmbë {med.specialTimer / 60} minuta!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          );
        })}

        {/* Empty state when no medications */}
        {medications.length === 0 && (
          <div className="card" style={{ marginTop: '2rem', background: '#FFF3E0', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💊</div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              Asnjë barn i shtuar ende
            </h3>
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#666' }}>
              Për të filluar, shko te <strong>Cilësimet → Barna</strong> dhe shto barnat që merr çdo ditë.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

