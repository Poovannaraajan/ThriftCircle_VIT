export interface User {
  id: string;
  google_id: string;
  name: string;
  reg_no: string | null;
  email: string;
  avatar_url: string | null;
  phone_number: string | null;
  trust_score: number;
  created_at: string;
}
