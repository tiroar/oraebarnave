import { useState, useEffect } from 'react';
import { db, EmergencyContact } from '../db/database';
import { medications } from '../data/medications';

export function EmergencyScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const allContacts = await db.emergencyContacts.orderBy('order').toArray();
    setContacts(allContacts);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const addContact = async (contact: Omit<EmergencyContact, 'id' | 'order'>) => {
    await db.emergencyContacts.add({
      ...contact,
      order: contacts.length
    });
    await loadContacts();
    setShowAddForm(false);
  };

  const updateContact = async (id: number, updates: Partial<EmergencyContact>) => {
    await db.emergencyContacts.update(id, updates);
    await loadContacts();
    setEditingContact(null);
  };

  const deleteContact = async (id: number) => {
    if (confirm('Fshi këtë kontakt?')) {
      await db.emergencyContacts.delete(id);
      await loadContacts();
    }
  };

  return (
    <div>
      <div className="header" style={{ background: '#D32F2F' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'white' }}>
          🚨 URGJENCË
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* Medical Summary for Paramedics */}
        <div className="card" style={{ 
          background: '#FFEBEE', 
          borderLeft: '6px solid #D32F2F',
          marginTop: '1.5rem'
        }}>
          <h2 style={{ color: '#D32F2F', marginBottom: '1rem', fontSize: '1.75rem' }}>
            ⚕️ Përmbledhje Mjekësore
          </h2>
          
          <div style={{ fontSize: '1.25rem', lineHeight: 2 }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>👤 Emri:</strong> Sevdije Zeqiri
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>🎂 Mosha:</strong> 71 vjeç
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>🏥 Diagnoza:</strong>
              <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                • Diabeti Tipi 2 (15 vjet)<br />
                • Parkinson (3 vjet)<br />
                • Neuropati Diabetike<br />
                • Osteoporoza<br />
                • Spondylosis
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>💊 Barna Aktuale:</strong>
              <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                {medications.map(med => (
                  <div key={med.id}>• {med.name} - {med.dose}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
            📞 Kontakte Urgjente
          </h2>

          {/* Primary contacts (large buttons) */}
          {contacts.filter(c => c.isPrimary).map(contact => (
            <button
              key={contact.id}
              onClick={() => handleCall(contact.phone)}
              className="btn-primary"
              style={{
                width: '100%',
                fontSize: '2rem',
                padding: '2rem',
                marginBottom: '1rem',
                background: '#D32F2F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>{contact.name}</div>
                <div style={{ fontSize: '1.5rem', opacity: 0.9 }}>{contact.relationship}</div>
                <div style={{ fontSize: '1.25rem', opacity: 0.8 }}>{contact.phone}</div>
              </div>
              <div style={{ fontSize: '3rem' }}>📞</div>
            </button>
          ))}

          {/* Add button if no contacts */}
          {contacts.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
              style={{ width: '100%', fontSize: '1.5rem', padding: '1.5rem' }}
            >
              ➕ Shto Kontakt të Parë
            </button>
          )}

          {/* Other contacts */}
          {contacts.filter(c => !c.isPrimary).length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                Kontakte të Tjera:
              </h3>
              {contacts.filter(c => !c.isPrimary).map(contact => (
                <div
                  key={contact.id}
                  className="card"
                  style={{ marginBottom: '1rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{contact.name}</div>
                      <div style={{ fontSize: '1.1rem', color: '#666' }}>{contact.relationship}</div>
                      <div style={{ fontSize: '1.25rem', color: '#2196F3', marginTop: '0.5rem' }}>
                        {contact.phone}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCall(contact.phone)}
                      className="btn-primary"
                      style={{ fontSize: '1.5rem', padding: '1rem 1.5rem' }}
                    >
                      📞
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => setEditingContact(contact)}
                      className="btn-outline"
                      style={{ flex: 1, fontSize: '1rem', padding: '0.75rem' }}
                    >
                      ✏️ Ndrysho
                    </button>
                    <button
                      onClick={() => contact.id && deleteContact(contact.id)}
                      className="btn-outline"
                      style={{ flex: 1, fontSize: '1rem', padding: '0.75rem', background: '#FFEBEE', color: '#C62828' }}
                    >
                      🗑️ Fshi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new contact button */}
          {contacts.length > 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-outline"
              style={{ width: '100%', fontSize: '1.25rem', padding: '1.25rem', marginTop: '1rem' }}
            >
              ➕ Shto Kontakt të Ri
            </button>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingContact) && (
          <ContactForm
            contact={editingContact}
            onSave={(contact) => {
              if (editingContact?.id) {
                updateContact(editingContact.id, contact);
              } else {
                addContact(contact);
              }
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingContact(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface ContactFormProps {
  contact: EmergencyContact | null;
  onSave: (contact: Omit<EmergencyContact, 'id' | 'order'>) => void;
  onCancel: () => void;
}

function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
  const [name, setName] = useState(contact?.name || '');
  const [relationship, setRelationship] = useState(contact?.relationship || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [isPrimary, setIsPrimary] = useState(contact?.isPrimary || false);

  const handleSubmit = () => {
    if (!name || !phone) {
      alert('Ju lutem plotësoni emrin dhe numrin e telefonit!');
      return;
    }
    onSave({ name, relationship, phone, isPrimary });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
          {contact ? '✏️ Ndrysho Kontaktin' : '➕ Shto Kontakt'}
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Emri:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="p.sh. Dr. Ahmed"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Lidhja:
          </label>
          <input
            type="text"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="p.sh. Djali, Doktori"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Telefoni:
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="p.sh. +383 44 123 456"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              style={{ width: '24px', height: '24px' }}
            />
            <span>Kontakt Kryesor (buton i madh i kuq)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ flex: 1, fontSize: '1.25rem', padding: '1.25rem' }}
          >
            ✅ Ruaj
          </button>
          <button
            onClick={onCancel}
            className="btn-outline"
            style={{ flex: 1, fontSize: '1.25rem', padding: '1.25rem' }}
          >
            ❌ Anulo
          </button>
        </div>
      </div>
    </div>
  );
}

