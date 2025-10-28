import { useState } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      emoji: '💊',
      title: 'Mirë se vini në Ora e Barnave!',
      description: 'Aplikacioni që ju ndihmon të mos harroni kur të merrni barnat tuaja.',
      buttonText: 'Fillo'
    },
    {
      emoji: '➕',
      title: 'Shtoni Barnat Tuaja',
      description: 'Filloni duke shtuar barnat që merrni çdo ditë. Shkoni te Cilësimet → Barna → Shto Barn të Ri.',
      buttonText: 'Në rregull'
    },
    {
      emoji: '🔔',
      title: 'Aktivizo Njoftimet',
      description: 'Aplikacioni do t\'ju kujtojë kur është koha për të marrë barnat. Lejoni njoftimet kur ju kërkohet.',
      buttonText: 'Në rregull'
    },
    {
      emoji: '📱',
      title: 'Instalo në Telefon',
      description: 'Për përvojë më të mirë, instaloni aplikacionin në ekranin kryesor. Klikoni "Instalo" kur shfaqet.',
      buttonText: 'Në rregull'
    },
    {
      emoji: '✅',
      title: 'Konfirmo Marrjen',
      description: 'Çdo herë që merrni një barn, klikoni "E MORA" për ta regjistruar në historinë tuaj.',
      buttonText: 'Në rregull'
    },
    {
      emoji: '🔒',
      title: 'Privatësia Juaj',
      description: 'Të gjitha të dhënat ruhen VETËM në pajisjen tuaj. Asgjë nuk dërgohet në internet.',
      buttonText: 'Fillojmë!'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark as completed in localStorage
      localStorage.setItem('welcomeCompleted', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('welcomeCompleted', 'true');
    onComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem 2rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        {/* Progress indicators */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index === currentStep ? '#4CAF50' : '#E0E0E0',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div style={{
          fontSize: '6rem',
          marginBottom: '2rem',
          animation: 'bounce 1s ease-in-out'
        }}>
          {currentStepData.emoji}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          color: '#333'
        }}>
          {currentStepData.title}
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '1.25rem',
          lineHeight: 1.6,
          color: '#666',
          marginBottom: '3rem'
        }}>
          {currentStepData.description}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={handleNext}
            style={{
              background: '#4CAF50',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 600,
              padding: '1.5rem',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {currentStepData.buttonText} →
          </button>

          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              style={{
                background: 'transparent',
                color: '#666',
                fontSize: '1.1rem',
                fontWeight: 600,
                padding: '1rem',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Kalo te aplikacioni
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}

