type TimeAgoUnit = 's' | 'min' | 'h' | 'j' | 'mo' | 'a';

export const getTimeBetweenTwoDate = (date:string | number) : string =>{
  const d = new Date(date);
  const now = new Date();
  const diffS = Math.floor((now.getTime() - d.getTime()) / 1000); // secondes écoulées

  if (diffS < 0) return 'à l\'instant'; // date dans le futur

  const abs = Math.abs(diffS);
  const units: { max: number; size: number; label: TimeAgoUnit }[] = [
    { max: 60, size: 1, label: 's' },
    { max: 3600, size: 60, label: 'min' },
    { max: 86400, size: 3600, label: 'h' },
    { max: 2592000, size: 86400, label: 'j' },
    { max: 31536000, size: 2592000, label: 'mo' },
    { max: Infinity, size: 31536000, label: 'a' },
  ];

  for (const u of units) {
    if (abs < u.max) {
      const val = Math.floor(abs / u.size);
      return `il y a ${val}${u.label}`;
    }
  }
  return 'il y a longtemps';
}