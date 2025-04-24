export interface CommentData {
  id: string;
  user: {
    name: string;
    profile_photo?: string;
  };
  comment: string;
  created_at: string;
  coordinates: [number, number];
  webTitle: string;
  currentLocation: string;
}

export interface PageInfo {
  url: string;
  title: string;
} 