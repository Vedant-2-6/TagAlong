export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  reviews: Review[];
}

export interface Listing {
  id: string;
  userId: string;
  source: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  capacity: {
    weight: number;
    volume: number;
  };
  acceptsFragile: boolean;
  price: number;
  vehicle: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Parcel {
  id: string;
  senderId: string;
  carrierId: string;
  source: string;
  destination: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  isFragile: boolean;
  requiresDeliveryBy: string;
  status: 'pending' | 'accepted' | 'in-transit' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorId: string;
  targetId: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'request' | 'status_update' | 'system';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}