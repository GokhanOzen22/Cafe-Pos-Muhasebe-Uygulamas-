export const formatCurrency = (amount: number, currencySymbol: string = '₺'): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + currencySymbol;
};

export const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const getElapsedTimeMinutes = (openedAtIso?: string): number => {
  if (!openedAtIso) return 0;
  const opened = new Date(openedAtIso).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((now - opened) / 60000));
};

export const formatMinutesToDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} dk`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs} sa ${mins} dk`;
};
