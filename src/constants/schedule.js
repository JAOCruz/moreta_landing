// Schedule configuration constants
export const DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

export const HOURS = [
  '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '---', // Break separator
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
];

// Helper function to get Monday of a given date
export const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};
