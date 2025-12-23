/**
 * Utilitário para tocar sons de notificação e mensagens
 * Usa Web Audio API como fallback se arquivos não existirem
 */

// Criar som de notificação programaticamente
export function playNotificationSound() {
  try {
    // Tentar carregar arquivo primeiro
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Se falhar, usar Web Audio API
      createNotificationSound();
    });
  } catch {
    createNotificationSound();
  }
}

// Criar som de mensagem programaticamente
export function playMessageSound() {
  try {
    // Tentar carregar arquivo primeiro
    const audio = new Audio('/sounds/message.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Se falhar, usar Web Audio API
      createMessageSound();
    });
  } catch {
    createMessageSound();
  }
}

function createNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Não foi possível tocar som de notificação:', error);
  }
}

function createMessageSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.warn('Não foi possível tocar som de mensagem:', error);
  }
}

