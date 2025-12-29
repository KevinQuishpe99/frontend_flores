import { useState, useEffect } from 'react';
import { extraerCodigoPais, extraerNumero } from '../utils/phoneUtils';

const COUNTRIES = [
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+1', name: 'USA/Canadá', flag: '🇺🇸' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+49', name: 'Alemania', flag: '🇩🇪' },
  { code: '+33', name: 'Francia', flag: '🇫🇷' },
  { code: '+39', name: 'Italia', flag: '🇮🇹' },
  { code: '+44', name: 'Reino Unido', flag: '🇬🇧' },
];

export default function CountryCodeSelector({ value, onChange, className = '', required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(extraerCodigoPais(value) || '+57');
  const [phoneNumber, setPhoneNumber] = useState(extraerNumero(value) || '');

  useEffect(() => {
    const code = extraerCodigoPais(value);
    const number = extraerNumero(value);
    if (code) setSelectedCode(code);
    if (number !== null) setPhoneNumber(number);
  }, [value]);

  const currentCountry = COUNTRIES.find(c => c.code === selectedCode) || COUNTRIES[0];

  const handleCodeChange = (code) => {
    setSelectedCode(code);
    const newValue = phoneNumber ? `${code} ${phoneNumber}` : code;
    onChange(newValue);
    setIsOpen(false);
  };

  const handleNumberChange = (e) => {
    let newNumber = e.target.value.replace(/[^0-9]/g, '');
    // Eliminar el 0 inicial si el número comienza con 0
    if (newNumber.startsWith('0')) {
      newNumber = newNumber.substring(1);
    }
    setPhoneNumber(newNumber);
    const newValue = newNumber ? `${selectedCode} ${newNumber}` : selectedCode;
    onChange(newValue);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          style={{ minWidth: '140px' }}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{currentCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCode}</span>
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCodeChange(country.code)}
                  className={`w-full px-3 py-2 text-left hover:bg-primary-50 flex items-center gap-2 transition-colors ${
                    selectedCode === country.code ? 'bg-primary-100 font-semibold' : ''
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                  <span className="text-sm font-medium text-gray-600">{country.code}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      <input
        type="tel"
        value={phoneNumber}
        onChange={handleNumberChange}
        className="input flex-1"
        placeholder="300 123 4567"
        pattern="[0-9]{7,12}"
        title="Ingresa solo números (sin espacios ni guiones)"
        required={required}
      />
    </div>
  );
}

