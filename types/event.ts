export type Event = {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  image_url: string | null;
  date: string;
  time: string;
  end_time?: string;
  location: string;
  ticket_price?: number;
  ticket_stock?: number;
  ticket_sale_location?: string;
  announcement?: string;
  created_at: string;
  updated_at: string;
};

export interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
} 