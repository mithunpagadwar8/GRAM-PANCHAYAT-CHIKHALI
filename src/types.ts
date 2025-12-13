
export interface Member {
  id: string;
  name: string;
  position: string;
  mobile: string;
  address?: string; 
  photoUrl: string;
  // Updated types to include specific village roles
  type: 'sarpanch' | 'upsarpanch' | 'member' | 'police_patil' | 'tantamukti' | 'pesa' | 'staff' | 'panchayat_samiti';
}

export interface TaxRecord {
  id: string;
  propertyId: string;
  ownerName: string;
  mobile: string;
  paymentType: 'House Tax' | 'Water Tax' | 'Special Water Tax';
  amount: number;
  status: 'Paid' | 'Pending';
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'youtube';
  publishDate: string;
  author: string;
  category?: 'General' | 'Development' | 'Notice';
}

export interface Complaint {
  id: string;
  applicantName: string;
  mobile: string;
  category: string;
  description: string;
  applicantPhotoUrl?: string;
  docUrl?: string;
  status: 'Open' | 'Resolved';
  date: string;
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
  title: string;
  type: 'Gram Sabha' | 'Masik Sabha' | 'Bal Sabha' | 'Ward Sabha';
  date: string;
  description: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'youtube';
}

export interface ImportantLink {
  id: string;
  title: string; 
  url: string;
  description?: string;
}

export interface AppSettings {
  logoUrl: string;
  flagUrl?: string;
  sliderImages: string[];
  panchayatName: string;
  marqueeText?: string;
  address: string;
  district: string;
  taluka: string;
  email: string;
  contactNumber: string;
  mapEmbedUrl: string;
  upiIdHouse?: string;
  upiIdWater?: string;
  upiIdSpecialWater?: string;
  taxListUrl?: string;
}
