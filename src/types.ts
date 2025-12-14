export interface Member {
  id: string;
  type: 'sarpanch' | 'upsarpanch' | 'member' | 'police_patil' | 'tantamukti' | 'pesa' | 'staff' | 'panchayat_samiti' | 'committee' | 'ps_staff';
  name: string;
  position: string;
  mobile: string;
  address: string;
  photoUrl: string;
}

export interface AppSettings {
  logoUrl: string;
  panchayatName: string;
  flagUrl: string;
  marqueeText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  contactNumber?: string; // Added based on usage in Contact.tsx
  taluka?: string;
  district?: string;
  email?: string;
  upiIdHouse?: string;
  upiIdWater?: string;
  upiIdSpecialWater?: string;
  sliderImages: string[];
  taxListUrl?: string;
  mapEmbedUrl?: string; // Added based on usage in Contact.tsx
}

export interface BlogPost {
  id: string;
  mediaType: 'image' | 'video' | 'youtube';
  category: string;
  title: string;
  content: string;
  publishDate: string;
  author: string;
  mediaUrl?: string;
}

export interface Complaint {
  id: string;
  status: 'Open' | 'Resolved';
  category?: string;
  subject?: string;
  description: string;
  applicantName?: string;
  mobile?: string;
  date: string;
  applicantPhotoUrl?: string;
  docUrl?: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  deadline?: string;
  docUrl?: string;
}

export interface MeetingRecord {
  id: string;
  type: string;
  mediaType?: 'image' | 'video';
  title: string;
  description: string;
  date?: string;
  mediaUrl?: string;
}

export interface ImportantLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface TaxRecord {
  id: string;
  paymentType: string;
  status: 'Pending' | 'Paid';
  amount: number;
  propertyId: string;
  ownerName: string;
  mobile?: string;
  date: string;
}
