import type { MediaSlot } from "./content";

/** Real photo slots. Files live in /public/assets/photos. */
export const photo = (file: string, label: string): MediaSlot => ({ file, label });

export const P = {
  sign: photo("TOWARDS_VAISHALI_SIGN.jpg", "Even the metro knew"),
  call: photo("CALL_SCREENSHOT.jpg", "12.03.2025 · 01:36:17"),
  gwalior: photo("VAISHALI_FIRST_MEETING.jpg", "Gwalior · 23.03.2025"),
  carSelfie: photo("FIRST_SELFIE.jpg", "The first selfie"),
  card: photo("FIRST_HANDMADE_GIFT.jpg", "23.03.2025 · the first handmade gift"),
  napkin: photo("NAPKIN_REAL.jpg", "The napkin · Farzi Cafe"),
  cappadocia: photo("TURKEY_CAPPADOCIA.jpg", "Cappadocia"),
  antalya: photo("TURKEY_ANTALYA.jpg", "Antalya"),
  antalya2: photo("TURKEY_ANTALYA_2.jpg", "Antalya · golden hour"),
  kiss: photo("FIRST_KISS.jpg", "18.05.2025"),
  shopping: photo("CHANDNI_CHOWK_SHOPPING.jpg", "Chandni Chowk"),
  cake: photo("ENGAGEMENT_CAKE.jpg", "28.06.2025 · the engagement"),
  postEngagement: photo("POST_ENGAGEMENT_TOGETHER.jpg", "After the engagement"),
  wedding: photo("WEDDING.jpg", "10.02.2026"),
  weddingRain: photo("WEDDING_RAIN.jpg", "10.02.2026 · the rain"),
  ccd: photo("CCD_DELHI_MEET.jpg", "Café Coffee Day · Delhi"),
  lucknow: photo("LUCKNOW.jpg", "Lucknow"),
  ayodhya: photo("AYODHYA.jpg", "Ayodhya"),
  birthday: photo("SHIVAM_S_BIRTHDAY.jpg", "My birthday, with you"),
  today: photo("TODAY.jpg", "06.11.2026"),
};
