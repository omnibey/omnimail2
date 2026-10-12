export interface ParsedDeviceInfo {
  device_type: 'Desktop' | 'Mobile' | 'Tablet';
  os: string;
  browser: string;
  ip_address: string;
  user_agent: string;
}

export function parseUserAgentAndIp(request: Request): ParsedDeviceInfo {
  const ua = request.headers.get('user-agent') || 'Unknown / API Client';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');

  let ip = '127.0.0.1';
  if (cfIp) {
    ip = cfIp.trim();
  } else if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp.trim();
  }

  // Detect Device Type
  let device_type: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  const uaLower = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk/i.test(ua)) {
    device_type = 'Tablet';
  } else if (/mobi|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    device_type = 'Mobile';
  }

  // Detect Operating System
  let os = 'Unknown OS';
  if (/windows nt 10.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/windows nt 6.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/iphone os (\d+([._]\d+)*)/i.test(ua)) {
    const match = ua.match(/iphone os (\d+([._]\d+)*)/i);
    os = `iOS ${match ? match[1].replace(/_/g, '.') : ''}`;
  } else if (/mac os x (\d+([._]\d+)*)/i.test(ua)) {
    const match = ua.match(/mac os x (\d+([._]\d+)*)/i);
    os = `macOS ${match ? match[1].replace(/_/g, '.') : ''}`;
  } else if (/android (\d+([._]\d+)*)/i.test(ua)) {
    const match = ua.match(/android (\d+([._]\d+)*)/i);
    os = `Android ${match ? match[1] : ''}`;
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  }

  // Detect Browser
  let browser = 'Unknown Browser';
  if (/edg\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/edg\/([0-9.]+)/i);
    browser = `Edge ${match ? match[1].split('.')[0] : ''}`;
  } else if (/opr\/([0-9.]+)|opera/i.test(ua)) {
    const match = ua.match(/opr\/([0-9.]+)/i);
    browser = `Opera ${match ? match[1].split('.')[0] : ''}`;
  } else if (/chrome\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/chrome\/([0-9.]+)/i);
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`;
  } else if (/firefox\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/firefox\/([0-9.]+)/i);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`;
  } else if (/version\/([0-9.]+).*safari/i.test(ua)) {
    const match = ua.match(/version\/([0-9.]+)/i);
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`;
  } else if (/safari/i.test(ua)) {
    browser = 'Safari';
  }

  return {
    device_type,
    os: os.trim(),
    browser: browser.trim(),
    ip_address: ip,
    user_agent: ua,
  };
}
