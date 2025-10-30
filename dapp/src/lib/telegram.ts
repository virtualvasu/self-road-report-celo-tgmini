export type TelegramWebApp = {
  initData: string;
  initDataUnsafe: any;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
  MainButton: { show: () => void; hide: () => void; setText: (t: string) => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
  HapticFeedback: { impactOccurred: (style: 'light' | 'medium' | 'heavy') => void };
  ready: () => void;
  expand: () => void;
  close: () => void;
};

export function getTelegram(): TelegramWebApp | undefined {
  const w = window as any;
  const tg: TelegramWebApp | undefined = w?.Telegram?.WebApp;
  return tg;
}

export function isTelegram(): boolean {
  return !!getTelegram();
}


