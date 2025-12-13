
import { AppSettings, BlogPost, ImportantLink, MeetingRecord, Member, Scheme, TaxRecord } from "./types";

export const INITIAL_SETTINGS: AppSettings = {
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg",
  flagUrl: "https://media.giphy.com/media/l3vRlT2k2L35Cnn5C/giphy.gif",
  sliderImages: [
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1935&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1874&auto=format&fit=crop"
  ],
  panchayatName: "ग्रामपंचायत चिखली",
  marqueeText: "स्वच्छ गाव, सुंदर गाव | पाणी टॅक्स आणि घर टॅक्स वेळेवर भरा आणि गावाच्या विकासात हातभार लावा | पुढील ग्रामसभा १५ तारखेला आहे.",
  address: "At Post Chikhali",
  taluka: "Kurkheda",
  district: "Gadchiroli",
  email: "sarpanch@gpchikhali.in",
  contactNumber: "9422XXXXXX",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.978936359196!2d80.0!3d20.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDM2JzE2LjMiTiA3OSw1OSw1MS41IkU!5e0!3m2!1sen!2sin!4v1633000000000!5m2!1sen!2sin",
  upiIdHouse: "gp.house@oksbi",
  upiIdWater: "gp.water@oksbi",
  upiIdSpecialWater: "gp.special@oksbi",
  taxListUrl: "" 
};

export const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'श्री. राजेश पाटील', position: 'सरपंच', mobile: '9876543210', address: 'मेन रोड, चिखली', photoUrl: 'https://ui-avatars.com/api/?name=Rajesh+Patil&background=FF9933&color=fff', type: 'sarpanch' },
  { id: '2', name: 'सौ. अनिता ताई', position: 'उपसरपंच', mobile: '9876543211', address: 'वार्ड क्र. १', photoUrl: 'https://ui-avatars.com/api/?name=Anita+Tai&background=138808&color=fff', type: 'upsarpanch' },
  { id: '3', name: 'श्री. रमेश भाऊ', position: 'ग्रामसेवक', mobile: '9876543214', address: 'पंचायत क्वार्टर', photoUrl: 'https://ui-avatars.com/api/?name=Ramesh+Bhau&background=0000FF&color=fff', type: 'staff' },
  { id: '4', name: 'श्री. सुरेश मेश्राम', position: 'पोलीस पाटील', mobile: '9988776611', address: 'पोलीस स्टेशन जवळ', photoUrl: 'https://ui-avatars.com/api/?name=Suresh+M&background=333&color=fff', type: 'police_patil' },
  { id: '5', name: 'श्री. गणपत राव', position: 'तंटामुक्त अध्यक्ष', mobile: '9988776622', address: 'वार्ड क्र. ४', photoUrl: 'https://ui-avatars.com/api/?name=Ganpat+Rao&background=800000&color=fff', type: 'tantamukti' },
  { id: '6', name: 'श्री. मोहन काका', position: 'पेसा अध्यक्ष', mobile: '9988776633', address: 'पेसा वस्ती', photoUrl: 'https://ui-avatars.com/api/?name=Mohan+Kaka&background=006400&color=fff', type: 'pesa' },
];

export const INITIAL_TAX_RECORDS: TaxRecord[] = [
  { id: '1', propertyId: 'PROP-001', ownerName: 'रामदास जाधव', mobile: '9988776655', paymentType: 'House Tax', amount: 1200, status: 'Pending', date: '2023-10-01' },
];

export const INITIAL_BLOGS: BlogPost[] = [
  { 
    id: '1', 
    title: 'गावात स्वच्छता मोहीम राबविण्यात आली', 
    content: 'आज महात्मा गांधी जयंती निमित्त संपूर्ण गावात स्वच्छता मोहीम राबविण्यात आली. यामध्ये सर्व ग्रामस्थांनी सहभाग घेतला.', 
    mediaUrl: '', 
    mediaType: 'image', 
    publishDate: '2023-10-02',
    author: 'Admin',
    category: 'Development'
  }
];

export const INITIAL_SCHEMES: Scheme[] = [
  { id: '1', name: 'प्रधानमंत्री आवास योजना (ग्रामीण)', description: 'सर्वांसाठी पक्के घर.', eligibility: 'बीपीएल धारक', deadline: '2024-03-31' },
  { id: '2', name: 'पीएम किसान सन्मान निधी', description: 'शेतकऱ्यांसाठी वार्षिक ६००० रुपये.', eligibility: 'जमीन धारक शेतकरी' }
];

export const INITIAL_MEETINGS: MeetingRecord[] = [
  { id: '1', title: 'पाणी पुरवठा बाबत विशेष ग्रामसभा', type: 'Gram Sabha', date: '2023-11-15', description: 'नवीन पाईपलाईन बाबत चर्चा.', mediaType: 'image' }
];

export const INITIAL_LINKS: ImportantLink[] = [
  { id: '1', title: 'जन्म/मृत्यू दाखला (Birth/Death)', url: 'https://crsorgi.gov.in/web/index.php/auth/login', description: 'दाखल्यासाठी अर्ज करा.' },
  { id: '2', title: '७/१२ उतारा (Mahabhulekh)', url: 'https://bhulekh.mahabhumi.gov.in/', description: 'डिजिटल ७/१२ डाऊनलोड करा.' },
  { id: '3', title: 'रेशन कार्ड (Ration Card)', url: 'https://rcms.mahafood.gov.in/', description: 'रेशन कार्ड माहिती.' }
];
