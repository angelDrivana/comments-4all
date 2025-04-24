export interface Comment {
  id?: string;
  userId: string;
  user?: {
    username: string;
    profile_photo?: string;
  };
  comment: string;
  created_at?: string;
  coordinates: [number, number];
  web_title: string;
  current_location: string;
}

export interface PageInfo {
  url: string;
  title: string;
} 