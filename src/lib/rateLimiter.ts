const PER_IP_LIMIT = 15;
const GLOBAL_DAILY_LIMIT = 180;

const perIpCounts = new Map<string, number>();
let globalCount = 0;
let globalDay = new Date().toDateString();

function resetGlobalIfNewDay() {
  const today = new Date().toDateString();
  if (today !== globalDay) {
    globalDay = today;
    globalCount = 0;
    perIpCounts.clear();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: "per_ip" | "global";
}

export function checkRateLimit(ip: string): RateLimitResult {
  resetGlobalIfNewDay();

  if (globalCount >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false, reason: "global" };
  }

  const ipCount = perIpCounts.get(ip) ?? 0;
  if (ipCount >= PER_IP_LIMIT) {
    return { allowed: false, reason: "per_ip" };
  }

  perIpCounts.set(ip, ipCount + 1);
  globalCount += 1;
  return { allowed: true };
}
