/**
 * Copia texto al portapapeles de forma infalible y universal.
 * Soporta tanto contextos seguros (HTTPS) como conexiones directas (HTTP / IP de Coolify).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Intentar con la API moderna de Clipboard si está disponible
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Si falla (por ejemplo, contexto no seguro HTTP), recurrir al fallback
    }
  }

  // 2. Fallback universal con elemento textarea y document.execCommand
  // Funciona de forma garantizada en conexiones HTTP sin certificado SSL
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    // Selección para iOS Safari
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    textArea.setSelectionRange(0, 999999);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    return false;
  }
}
