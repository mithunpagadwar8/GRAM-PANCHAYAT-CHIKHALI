import { AppSettings, Member, BlogPost, TaxRecord, Scheme, MeetingRecord, ImportantLink } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  logoUrl: '',
  panchayatName: 'Gram Panchayat Chikhali',
  flagUrl: '',
  marqueeText: 'Welcome to the official portal of Gram Panchayat Chikhali',
  contactEmail: 'contact@example.com',
  contactPhone: '1234567890',
  address: 'At Post Chikhali, Dist. Buldhana',
  sliderImages: [],
  taluka: '',
  district: '',
  email: '',
  upiIdHouse: '',
  upiIdWater: '',
  upiIdSpecialWater: ''
};

export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_BLOGS: BlogPost[] = [];
export const INITIAL_TAX_RECORDS: TaxRecord[] = [];
export const INITIAL_SCHEMES: Scheme[] = [];
export const INITIAL_MEETINGS: MeetingRecord[] = [];
export const INITIAL_LINKS: ImportantLink[] = [];
