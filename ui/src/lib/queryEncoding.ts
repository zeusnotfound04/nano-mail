
export function encodeQueryParam(value: string): string {
  if (!value) return '';
  

  let encoded = btoa(value);
  encoded = encoded.split('').reverse().join('');
  

  const timestamp = Date.now().toString(36);
  
  return `${timestamp}_${encoded}`;
}

export function decodeQueryParam(encodedValue: string): string {
  if (!encodedValue || !encodedValue.includes('_')) return '';
  
  try {

    const [, encoded] = encodedValue.split('_');
    

    const reversed = encoded.split('').reverse().join('');
    

    return atob(reversed);
  } catch (error) {
    console.error('Error decoding query param:', error);
    return '';
  }
}