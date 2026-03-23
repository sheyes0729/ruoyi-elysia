import svgCaptcha from "svg-captcha";
import { redis, REDIS_KEYS } from "../../plugins/redis";

const CAPTCHA_EXPIRE_SECONDS = 300;

export class CaptchaService {
  async generate(): Promise<{
    uuid: string;
    img: string;
  }> {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: "0o1iIl",
      noise: 3,
      color: true,
      background: "#f4f4f4",
      width: 120,
      height: 40,
    });

    const uuid = crypto.randomUUID();
    const key = `${REDIS_KEYS.CAPTCHA}${uuid}`;

    await redis.setex(key, CAPTCHA_EXPIRE_SECONDS, captcha.text.toLowerCase());

    return {
      uuid,
      img: captcha.data,
    };
  }

  async verify(uuid: string, code: string): Promise<boolean> {
    if (!uuid || !code) {
      return false;
    }

    const key = `${REDIS_KEYS.CAPTCHA}${uuid}`;
    const cached = await redis.get(key);

    if (!cached) {
      return false;
    }

    const isValid = cached === code.toLowerCase();

    if (isValid) {
      await redis.del(key);
    }

    return isValid;
  }
}

export const captchaService = new CaptchaService();
