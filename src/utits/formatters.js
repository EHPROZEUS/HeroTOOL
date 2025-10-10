// Formater une date au format français
export const formatDateFr = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// Calculer le temps écoulé depuis une date
export const calculateTimeSince = (dateString) => {
  if (!dateString) return '';
  
  const pastDate = new Date(dateString);
  const today = new Date();
  
  let years = today.getFullYear() - pastDate.getFullYear();
  let months = today.getMonth() - pastDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years === 0 && months === 0) return 'Ce mois';
  if (years === 0) return `Il y a ${months} mois`;
  if (months === 0) return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  return `Il y a ${years} an${years > 1 ? 's' : ''} et ${months} mois`;
};

// Calculer l'âge du véhicule
export const calculateVehicleAge = (dateString) => {
  if (!dateString) return '';
  
  const vehicleDate = new Date(dateString);
  const today = new Date();
  
  let years = today.getFullYear() - vehicleDate.getFullYear();
  let months = today.getMonth() - vehicleDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years === 0 && months === 0) return 'Neuf';
  if (years === 0) return `${months} mois`;
  if (months === 0) return `${years} an${years > 1 ? 's' : ''}`;
  return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
};

// Formater les dimensions de pneus
export const formatTireSize = (value) => {
  let formatted = value.toUpperCase().replace(/[^0-9/R A-Z]/g, '');
  const numbers = formatted.replace(/[^0-9]/g, '');
  const afterSpace = formatted.includes(' ') ? formatted.split(' ').slice(1).join(' ') : '';
  
  if (numbers.length <= 3) {
    formatted = numbers;
  } else if (numbers.length <= 5) {
    formatted = numbers.slice(0, 3) + '/' + numbers.slice(3);
  } else if (numbers.length <= 7) {
    formatted = numbers.slice(0, 3) + '/' + numbers.slice(3, 5) + 'R' + numbers.slice(5, 7);
  } else {
    formatted = numbers.slice(0, 3) + '/' + numbers.slice(3, 5) + 'R' + numbers.slice(5, 7) + ' ' + numbers.slice(7);
  }
  
  if (afterSpace && numbers.length >= 7) {
    formatted = numbers.slice(0, 3) + '/' + numbers.slice(3, 5) + 'R' + numbers.slice(5, 7) + ' ' + afterSpace;
  }
  
  return formatted;
};
