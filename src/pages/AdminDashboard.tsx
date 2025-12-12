
import React, { useState, useEffect } from 'react';
import { AppSettings, BlogPost, Complaint, ImportantLink, MeetingRecord, Member, Scheme, TaxRecord } from '../types';
import { FileUpload } from '../components/FileUpload';
import { addToCollection, deleteFromCollection, updateInCollection } from '../services/db';
import { isConfigured, auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";

interface AdminDashboardProps {
  interface AdminDashboardProps {
  settings: AppSettings;
  setSettings: (newSettings: AppSettings) => void;
  
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  settings: AppSettings;
  setSettings: (newSettings: AppSettings) => void;
  taxRecords: TaxRecord[];
  setTaxRecords: React.Dispatch<React.SetStateAction<TaxRecord[]>>;
  complaints: Complaint[];
  setComplaints?: React.Dispatch<React.SetStateAction<Complaint[]>>; 
  blogs: BlogPost[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  schemes: Scheme[];
  setSchemes: React.Dispatch<React.SetStateAction<Scheme[]>>;
  meetings: MeetingRecord[];
  setMeetings: React.Dispatch<React.SetStateAction<MeetingRecord[]>>;
  links: ImportantLink[];
  setLinks: React.Dispatch<React.SetStateAction<ImportantLink[]>>;
  isCloudConnected: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  members, setMembers, settings, setSettings, taxRecords, setTaxRecords, 
  complaints, setComplaints, 
  blogs, setBlogs, schemes, setSchemes, meetings, setMeetings, links, setLinks,
  isCloudConnected
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'notices' | 'schemes' | 'blog' | 'meetings' | 'tax' | 'members' | 'settings' | 'complaints'>('overview');
  
  // Security State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login Form State
  const [email, setEmail] = useState('mithunpagadwar8@gmail.com');
  const [password, setPassword] = useState('Jitesh$@0824');

  // Forms State
  const [newMember, setNewMember] = useState<Partial<Member>>({ type: 'member', name: '', position: '', mobile: '', address: '', photoUrl: '' });
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({ mediaType: 'image', category: 'General', title: '', content: '' }); 
  const [newNotice, setNewNotice] = useState<Partial<BlogPost>>({ mediaType: 'image', category: 'Notice', title: '', content: '' });
  const [newTaxRecord, setNewTaxRecord] = useState<Partial<TaxRecord>>({ paymentType: 'House Tax', status: 'Pending', amount: 0, propertyId: '', ownerName: '' });
  const [newScheme, setNewScheme] = useState<Partial<Scheme>>({ name: '', description: '', eligibility: '' });
  const [newMeeting, setNewMeeting] = useState<Partial<MeetingRecord>>({ type: 'Gram Sabha', mediaType: 'image', title: '', description: '' });
  const [newLink, setNewLink] = useState<Partial<ImportantLink>>({ title: '', url: '', description: '' });

  // Monitor Authentication State
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setLoading(false);
      });
      return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsRegistering(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          handleRegister(); 
      } else if (error.code === 'auth/wrong-password') {
          setAuthError('Incorrect Password.');
      } else {
          setAuthError(error.message);
      }
    }
  };

  const handleRegister = async () => {
      setAuthError('');
      setIsRegistering(true);
      try {
          await createUserWithEmailAndPassword(auth, email, password);
      } catch (createError: any) {
          setIsRegistering(false);
          setAuthError(createError.message);
      }
  };

  const handleLogout = async () => {
      await signOut(auth);
  };

  // --- CLOUD WRAPPER ---
  const executeAction = async (collection: string, data: any, localUpdate: () => void) => {
      if (isConfigured() && isCloudConnected) {
          await addToCollection(collection, data);
      } else {
          localUpdate();
      }
  };

  // FIXED: Delete Logic with robust Optimistic Update
  const executeDelete = (collection: string, id: string, localUpdate: () => void) => {
      if(!window.confirm("Are you sure you want to delete this item?")) return;

      console.log(`Deleting ${collection} item: ${id}`);
      
      // 1. Optimistic Update (Immediate Removal)
      localUpdate();

      // 2. Cloud Delete (Background)
      if (isConfigured()) {
          deleteFromCollection(collection, id).then(success => {
              if(!success) console.warn("Cloud delete failed or permission denied.");
          });
      }
  };

  const executeUpdate = async (collection: string, id: string, data: any, localUpdate: () => void) => {
      if (isConfigured() && isCloudConnected) {
          await updateInCollection(collection, id, data);
      } else {
          localUpdate();
      }
  };

  // --- HANDLERS ---
  const handleAddMember = () => {
    if(!newMember.name) { alert("Name is required"); return; }
    const memberToAdd = { ...newMember, id: Date.now().toString(), photoUrl: newMember.photoUrl || 'https://ui-avatars.com/api/?name=' + newMember.name + '&background=random' } as Member;
    executeAction('members', memberToAdd, () => setMembers(prev => [...prev, memberToAdd]));
    setNewMember({ type: 'member', name: '', position: '', mobile: '', address: '', photoUrl: '' });
  };
  
  const handleAddBlog = () => { 
      if(!newPost.title) return; 
      const post = { ...newPost, id: Date.now().toString(), publishDate: new Date().toLocaleDateString(), author: 'Admin', category: 'General' } as BlogPost;
      executeAction('blogs', post, () => setBlogs(prev => [post, ...prev]));
      setNewPost({ mediaType: 'image', category: 'General', title: '', content: '' }); 
  };
  
  const handleAddNotice = () => { 
      if(!newNotice.title) return; 
      const notice = { ...newNotice, id: Date.now().toString(), publishDate: new Date().toLocaleDateString(), author: 'Admin', category: 'Notice' } as BlogPost;
      executeAction('blogs', notice, () => setBlogs(prev => [notice, ...prev]));
      setNewNotice({ mediaType: 'image', category: 'Notice', title: '', content: '' }); 
  };

  const handleAddTax = () => { 
      if(!newTaxRecord.propertyId) return; 
      const tax = { ...newTaxRecord, id: Date.now().toString(), date: new Date().toISOString() } as TaxRecord;
      executeAction('taxRecords', tax, () => setTaxRecords(prev => [...prev, tax]));
      setNewTaxRecord({ paymentType: 'House Tax', status: 'Pending', amount: 0, propertyId: '', ownerName: '' }); 
  };

  const handleAddScheme = () => { 
      if(!newScheme.name) return; 
      const scheme = { ...newScheme, id: Date.now().toString() } as Scheme;
      executeAction('schemes', scheme, () => setSchemes(prev => [...prev, scheme]));
      setNewScheme({ name: '', description: '', eligibility: '' }); 
  };

  const handleAddMeeting = () => { 
      if(!newMeeting.title) return; 
      const meeting = { ...newMeeting, id: Date.now().toString() } as MeetingRecord;
      executeAction('meetings', meeting, () => setMeetings(prev => [...prev, meeting]));
      setNewMeeting({ type: 'Gram Sabha', mediaType: 'image', title: '', description: '' }); 
  };

  const handleAddLink = () => { 
      if(!newLink.title || !newLink.url) return; 
      const link = { ...newLink, id: Date.now().toString() } as ImportantLink;
      executeAction('links', link, () => setLinks(prev => [...prev, link]));
      setNewLink({ title: '', url: '', description: '' }); 
  };

  const deleteTax = (e: React.MouseEvent, id: string) => { e.preventDefault(); executeDelete('taxRecords', id, () => setTaxRecords(prev => prev.filter(item => item.id !== id))); };
  const deleteMember = (e: React.MouseEvent, id: string) => { e.preventDefault(); executeDelete('members', id, () => setMembers(prev => prev.filter(item => item.id !== id))); };
  const deleteBlogPost = (e: React.MouseEvent, id: string) => { e.preventDefault(); executeDelete('blogs', id, () => setBlogs(prev => prev.filter(item => item.id !== id))); };
  const deleteScheme = (e: React.MouseEvent, id: string) => { e.preventDefault(); executeDelete('schemes', id, () => setSchemes(prev => prev.filter(item => item.id !== id))); };
  const deleteMeeting = (e: React.MouseEvent, id: string) => { e.preventDefault(); executeDelete('meetings', id, () => setMeetings(prev => prev.filter(item => item.id !== id))); };
  const deleteLink = (e: React.MouseEvent, id: string) => { e.preventDefault(); executeDelete('links', id, () => setLinks(prev => prev.filter(item => item.id !== id))); };
  const deleteComplaint = (e: React.MouseEvent, id: string) => { e.preventDefault(); executeDelete('complaints', id, () => setComplaints && setComplaints(prev => prev.filter(item => item.id !== id))); };

  const toggleComplaintStatus = (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'Open' ? 'Resolved' : 'Open';
      executeUpdate('complaints', id, { status: newStatus }, () => {
          if(setComplaints) setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
      });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-orange-500">
           <div className="text-center mb-6">
              <i className="fas fa-landmark text-4xl text-orange-500 mb-2"></i>
              <h2 className="text-2xl font-bold text-gray-800">Gram Panchayat Admin</h2>
              <p className="text-gray-500">Secure Login Portal</p>
           </div>
           <form onSubmit={handleLogin} className="space-y-4">
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-3 rounded" placeholder="Email ID" required />
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-3 rounded" placeholder="Password" required />
             {authError && <div className="text-red-500 text-sm">{authError}</div>}
             <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded shadow">
                {isRegistering ? 'Registering...' : 'Secure Login'}
             </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex shadow-2xl">
            <div className="p-6 font-bold text-lg border-b border-gray-700 bg-orange-600">
                <i className="fas fa-user-shield mr-2"></i> Admin Panel
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {[
                    { id: 'overview', icon: 'fa-tachometer-alt', label: 'Dashboard' },
                    { id: 'members', icon: 'fa-users', label: 'Members & Staff' },
                    { id: 'tax', icon: 'fa-rupee-sign', label: 'Taxation' },
                    { id: 'blog', icon: 'fa-newspaper', label: 'News & Blog' },
                    { id: 'notices', icon: 'fa-bell', label: 'Notices' },
                    { id: 'schemes', icon: 'fa-hand-holding-heart', label: 'Schemes' },
                    { id: 'meetings', icon: 'fa-handshake', label: 'Meetings' },
                    { id: 'complaints', icon: 'fa-clipboard-list', label: 'Complaints' },
                    { id: 'settings', icon: 'fa-cogs', label: 'Settings' },
                ].map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === item.id ? 'bg-orange-500 shadow-md font-bold' : 'hover:bg-slate-800'}`}>
                        <i className={`fas ${item.icon} w-6 text-center`}></i> {item.label}
                    </button>
                ))}
            </nav>
            <div className="p-4 bg-slate-800 border-t border-gray-700">
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 w-full text-left"><i className="fas fa-sign-out-alt"></i> Logout</button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50 relative">
            <div className="p-6 max-w-6xl mx-auto">
                
                {activeTab === 'members' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-orange-500">
                            <h3 className="text-xl font-bold mb-4">Add Gram Panchayat Member/Staff</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded border border-orange-100 mb-4">
                                <input className="border p-2 rounded" placeholder="Full Name (पूर्ण नाव)" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                                <input className="border p-2 rounded" placeholder="Position (पद - e.g. सरपंच)" value={newMember.position} onChange={e => setNewMember({...newMember, position: e.target.value})} />
                                <input className="border p-2 rounded" placeholder="Mobile" value={newMember.mobile} onChange={e => setNewMember({...newMember, mobile: e.target.value})} />
                                <select className="border p-2 rounded bg-white" value={newMember.type} onChange={e => setNewMember({...newMember, type: e.target.value as any})}>
                                    <option value="sarpanch">Sarpanch (सरपंच)</option>
                                    <option value="upsarpanch">Upsarpanch (उपसरपंच)</option>
                                    <option value="member">Gram Panchayat Member (ग्रामपंचायत सदस्य)</option>
                                    <option value="police_patil">Police Patil (पोलीस पाटील)</option>
                                    <option value="tantamukti">Tantamukti Adhyaksh (तंटामुक्ती अध्यक्ष)</option>
                                    <option value="pesa">PESA Committee (पेसा समिती)</option>
                                    <option value="panchayat_samiti">Panchayat Samiti (पंचायत समिती)</option>
                                    <option value="staff">Staff (कर्मचारी)</option>
                                </select>
                                <div className="md:col-span-2">
                                     <FileUpload label="Profile Photo" accept="image/*" onFileSelect={(url) => setNewMember({...newMember, photoUrl: url})} />
                                </div>
                                <button onClick={handleAddMember} className="bg-orange-600 text-white font-bold py-2 px-4 rounded md:col-span-2 hover:bg-orange-700">Add Member</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {members.map(m => (
                                    <div key={m.id} className="bg-white border p-3 rounded flex items-center gap-3 shadow-sm">
                                        <img src={m.photoUrl} className="w-12 h-12 rounded-full object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold truncate">{m.name}</div>
                                            <div className="text-xs text-gray-500 uppercase">{m.position}</div>
                                        </div>
                                        <button onClick={(e) => deleteMember(e, m.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tax' && (
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-600">
                        <h3 className="text-xl font-bold mb-4">Taxation Management (कर विभाग)</h3>
                        
                        <div className="bg-green-50 p-4 rounded mb-6 border border-green-200">
                             <h4 className="font-bold mb-2">Add New Tax Record</h4>
                             <div className="flex flex-wrap gap-2 items-center">
                                 <input className="border p-2 rounded w-40" placeholder="Property ID" value={newTaxRecord.propertyId} onChange={e => setNewTaxRecord({...newTaxRecord, propertyId: e.target.value})} />
                                 <span className="text-xs text-gray-500">(e.g. PROP-12345)</span>
                                 <input className="border p-2 rounded flex-1" placeholder="Owner Name" value={newTaxRecord.ownerName} onChange={e => setNewTaxRecord({...newTaxRecord, ownerName: e.target.value})} />
                                 <select className="border p-2 rounded bg-white" value={newTaxRecord.paymentType} onChange={e => setNewTaxRecord({...newTaxRecord, paymentType: e.target.value as any})}>
                                     <option value="House Tax">House Tax (घरपट्टी)</option>
                                     <option value="Water Tax">Water Tax (पाणीपट्टी)</option>
                                     <option value="Special Water Tax">Special Water Tax (खास पाणीपट्टी)</option>
                                 </select>
                                 <input className="border p-2 rounded w-28" type="number" placeholder="Amount" value={newTaxRecord.amount || ''} onChange={e => setNewTaxRecord({...newTaxRecord, amount: Number(e.target.value)})} />
                                 <button onClick={handleAddTax} className="bg-green-600 text-white px-4 py-2 rounded font-bold">Add</button>
                             </div>
                        </div>
                        
                        {/* Tax List Upload */}
                        <div className="mb-6 p-4 border rounded">
                             <label className="font-bold block mb-2">Upload Public Tax List (PDF)</label>
                             <div className="flex gap-4">
                                <div className="flex-1"><FileUpload label="Select File" accept=".pdf" onFileSelect={(url) => setSettings({...settings, taxListUrl: url})} /></div>
                                {settings.taxListUrl && <a href={settings.taxListUrl} target="_blank" className="text-blue-600 underline self-center">View Current List</a>}
                             </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100"><tr><th className="p-2">ID</th><th className="p-2">Owner</th><th className="p-2">Type</th><th className="p-2">Amount</th><th className="p-2">Action</th></tr></thead>
                                <tbody>
                                    {taxRecords.map(t => (
                                        <tr key={t.id} className="border-b">
                                            <td className="p-2 font-mono font-bold text-blue-800">{t.propertyId}</td>
                                            <td className="p-2">{t.ownerName}</td>
                                            <td className="p-2"><span className="bg-gray-200 px-2 py-1 rounded text-xs">{t.paymentType}</span></td>
                                            <td className="p-2">₹{t.amount}</td>
                                            <td className="p-2"><button onClick={(e) => deleteTax(e, t.id)} className="text-red-500"><i className="fas fa-trash"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'blog' && (
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                        <h3 className="text-xl font-bold mb-4">News & Blog Publishing</h3>
                        <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-100 space-y-3">
                             <input className="w-full border p-2 rounded font-bold" placeholder="Headline / Title" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
                             <textarea className="w-full border p-2 rounded h-24" placeholder="Content..." value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})}></textarea>
                             <div className="flex gap-4">
                                 <select className="border p-2 rounded" value={newPost.mediaType} onChange={e => setNewPost({...newPost, mediaType: e.target.value as any})}>
                                     <option value="image">Image Upload</option>
                                     <option value="video">Video Upload</option>
                                     <option value="youtube">YouTube Link</option>
                                 </select>
                                 {newPost.mediaType === 'youtube' ? 
                                    <input className="border p-2 rounded flex-1" placeholder="YouTube URL" value={newPost.mediaUrl} onChange={e => setNewPost({...newPost, mediaUrl: e.target.value})} /> :
                                    <div className="flex-1"><FileUpload label="Media File" accept={newPost.mediaType === 'video' ? 'video/*' : 'image/*'} onFileSelect={(url) => setNewPost({...newPost, mediaUrl: url})} /></div>
                                 }
                             </div>
                             <button onClick={handleAddBlog} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Publish Post</button>
                        </div>
                        <div className="space-y-2">
                             {blogs.filter(b => b.category !== 'Notice').map(b => (
                                 <div key={b.id} className="flex justify-between items-center border p-2 rounded bg-gray-50">
                                     <span className="font-bold">{b.title}</span>
                                     <button onClick={(e) => deleteBlogPost(e, b.id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* --- NOTICES SECTION --- */}
                {activeTab === 'notices' && (
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gov-primary"><i className="fas fa-bell mr-2"></i> Publish Notice</h3>
                            <div className="space-y-4 mb-6 bg-yellow-50 p-4 rounded border border-yellow-200">
                                <input className="w-full border p-2 font-bold" placeholder="Notice Title" value={newNotice.title || ''} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
                                <textarea className="w-full border p-2 h-20" placeholder="Notice Details..." value={newNotice.content || ''} onChange={e => setNewNotice({...newNotice, content: e.target.value})}></textarea>
                                
                                <div className="p-2 border border-yellow-300 rounded bg-white">
                                    <p className="text-sm font-bold text-gray-600 mb-1">Notice Image/File Upload:</p>
                                    <FileUpload label="Upload Notice Image" accept="image/*,.pdf" onFileSelect={(url) => setNewNotice({...newNotice, mediaUrl: url})} />
                                </div>

                                <button onClick={handleAddNotice} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-bold">Publish Notice</button>
                            </div>
                         </div>
                         <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold mb-4">Active Notices</h3>
                            <div className="space-y-2">
                                {blogs.filter(b => b.category === 'Notice').length === 0 && <p className="text-gray-500 italic">No notices found.</p>}
                                {blogs.filter(b => b.category === 'Notice').map(notice => (
                                    <div key={notice.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border-l-4 border-yellow-500">
                                        <div className="flex items-center gap-3">
                                            {notice.mediaUrl && <img src={notice.mediaUrl} className="w-10 h-10 object-cover rounded" alt="Notice" />}
                                            <div>
                                                <div className="font-bold">{notice.title}</div>
                                                <div className="text-xs text-gray-500">{notice.publishDate}</div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={(e) => deleteBlogPost(e, notice.id)} className="bg-red-500 text-white w-8 h-8 rounded flex items-center justify-center hover:bg-red-700 shadow"><i className="fas fa-trash"></i></button>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                )}

                {/* --- SCHEMES SECTION --- */}
                {activeTab === 'schemes' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gov-primary"><i className="fas fa-hand-holding-heart mr-2"></i> Government Schemes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded">
                            <input placeholder="Scheme Name" className="border p-2 rounded" value={newScheme.name || ''} onChange={e => setNewScheme({...newScheme, name: e.target.value})} />
                            <input placeholder="Eligibility Criteria" className="border p-2 rounded" value={newScheme.eligibility || ''} onChange={e => setNewScheme({...newScheme, eligibility: e.target.value})} />
                            <input placeholder="Description" className="border p-2 rounded" value={newScheme.description || ''} onChange={e => setNewScheme({...newScheme, description: e.target.value})} />
                            <input type="date" className="border p-2 rounded" value={newScheme.deadline || ''} onChange={e => setNewScheme({...newScheme, deadline: e.target.value})} />
                            <div className="col-span-1 md:col-span-2">
                                    <FileUpload label="Scheme PDF/Image" accept=".pdf,image/*" onFileSelect={(url) => setNewScheme({...newScheme, docUrl: url})} />
                            </div>
                            <button onClick={handleAddScheme} className="bg-green-600 text-white font-bold p-2 rounded">Add Scheme</button>
                        </div>
                        <ul className="space-y-2">
                            {schemes.map(s => (
                                <li key={s.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                                    <div>
                                        <div className="font-semibold">{s.name}</div>
                                        <div className="text-xs text-gray-500">Elig: {s.eligibility}</div>
                                    </div>
                                    <button type="button" onClick={(e) => deleteScheme(e, s.id)} className="bg-red-500 text-white w-8 h-8 rounded flex items-center justify-center hover:bg-red-700 shadow"><i className="fas fa-trash"></i></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* --- MEETINGS SECTION --- */}
                {activeTab === 'meetings' && (
                    <div className="bg-white p-6 rounded-lg shadow h-full">
                         <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gov-primary">Manage Meetings (Sabha)</h3>
                         <div className="bg-gray-50 p-4 rounded mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className="border p-2" placeholder="Meeting Title" value={newMeeting.title || ''} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} />
                            <select className="border p-2" value={newMeeting.type} onChange={e => setNewMeeting({...newMeeting, type: e.target.value as any})}>
                                <option value="Gram Sabha">Gram Sabha</option>
                                <option value="Masik Sabha">Masik Sabha</option>
                                <option value="Bal Sabha">Bal Sabha</option>
                                <option value="Ward Sabha">Ward Sabha</option>
                            </select>
                            <input type="date" className="border p-2" value={newMeeting.date || ''} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} />
                            <input className="border p-2" placeholder="Description/Agenda" value={newMeeting.description || ''} onChange={e => setNewMeeting({...newMeeting, description: e.target.value})} />
                            <div className="col-span-1 md:col-span-2">
                                <FileUpload label="Meeting Photo/Video/Minutes" accept="image/*,video/*,.pdf" onFileSelect={(url) => setNewMeeting({...newMeeting, mediaUrl: url})} />
                            </div>
                            <button onClick={handleAddMeeting} className="col-span-1 md:col-span-2 bg-gov-secondary text-white py-2 font-bold rounded">Record Meeting</button>
                         </div>
                         
                         <div className="grid gap-4">
                            {meetings.map(m => (
                                <div key={m.id} className="border p-4 rounded flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded text-white ${m.type === 'Gram Sabha' ? 'bg-purple-600' : 'bg-blue-600'}`}>{m.type}</span>
                                        <h4 className="font-bold mt-1">{m.title}</h4>
                                        <p className="text-sm text-gray-500">{m.date}</p>
                                    </div>
                                    <button type="button" onClick={(e) => deleteMeeting(e, m.id)} className="bg-red-500 text-white w-8 h-8 rounded flex items-center justify-center hover:bg-red-700 shadow"><i className="fas fa-trash"></i></button>
                                </div>
                            ))}
                         </div>
                    </div>
                )}

                {/* --- COMPLAINTS SECTION --- */}
                {activeTab === 'complaints' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                         <div className="flex justify-between items-center mb-6 border-b pb-2">
                             <h3 className="text-xl font-bold text-gov-primary"><i className="fas fa-clipboard-list mr-2"></i> Citizen Complaints (Grievance Redressal)</h3>
                             <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">Total: {complaints.length}</span>
                         </div>
                         
                         {complaints.length === 0 ? (
                             <div className="text-center py-12 text-gray-500">
                                 <i className="fas fa-check-circle text-4xl mb-3 text-green-500"></i>
                                 <p>No complaints found.</p>
                             </div>
                         ) : (
                             <div className="grid gap-6">
                                 {complaints.map(c => (
                                     <div key={c.id} className={`border rounded-lg p-4 flex flex-col md:flex-row gap-4 ${c.status === 'Resolved' ? 'bg-gray-50 border-gray-200' : 'bg-white border-red-200 shadow-sm'}`}>
                                         {/* Photos Column */}
                                         <div className="flex-shrink-0 flex gap-2 md:flex-col md:w-32">
                                             {c.applicantPhotoUrl ? (
                                                 <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden mx-auto border">
                                                    <img src={c.applicantPhotoUrl} className="w-full h-full object-cover" alt="Applicant" />
                                                 </div>
                                             ) : <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center mx-auto text-gray-400 text-xs text-center p-1">No Photo</div>}
                                             
                                             {c.docUrl && (
                                                <a href={c.docUrl} target="_blank" rel="noreferrer" className="text-xs bg-blue-100 text-blue-700 p-2 rounded text-center hover:bg-blue-200">
                                                    <i className="fas fa-file-alt mr-1"></i> View Doc
                                                </a>
                                             )}
                                         </div>

                                         {/* Info Column */}
                                         <div className="flex-1">
                                             <div className="flex justify-between items-start mb-2">
                                                 <div>
                                                     <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-lg text-gray-800">{c.applicantName}</h4>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{c.category}</span>
                                                     </div>
                                                     <p className="text-sm text-gray-600"><i className="fas fa-phone mr-1"></i> {c.mobile}</p>
                                                     <p className="text-xs text-gray-400 mt-1">Date: {c.date} | ID: {c.id}</p>
                                                 </div>
                                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${c.status === 'Open' ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'}`}>
                                                     {c.status}
                                                 </span>
                                             </div>
                                             <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border">
                                                 <span className="font-bold block text-xs text-gray-500 mb-1">COMPLAINT DETAILS:</span>
                                                 {c.description}
                                             </div>
                                             
                                             <div className="mt-4 flex gap-2 justify-end">
                                                 <button 
                                                    onClick={() => toggleComplaintStatus(c.id, c.status)}
                                                    className={`px-4 py-2 rounded text-sm font-bold shadow transition ${c.status === 'Open' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                                                 >
                                                     {c.status === 'Open' ? <><i className="fas fa-check mr-2"></i> Mark Resolved</> : <><i className="fas fa-redo mr-2"></i> Re-open</>}
                                                 </button>
                                                 <button 
                                                    onClick={(e) => deleteComplaint(e, c.id)}
                                                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-red-100 hover:text-red-600 transition"
                                                    title="Delete Record"
                                                 >
                                                     <i className="fas fa-trash"></i>
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>
                )}

                {/* --- SETTINGS SECTION --- */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-4 text-gov-primary">Global Location & Contact Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Panchayat Name</label>
                                    <input className="w-full border p-2 rounded" value={settings.panchayatName} onChange={e => setSettings({...settings, panchayatName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Taluka (Panchayat Samiti)</label>
                                    <input className="w-full border p-2 rounded" value={settings.taluka} onChange={e => setSettings({...settings, taluka: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">District</label>
                                    <input className="w-full border p-2 rounded" value={settings.district} onChange={e => setSettings({...settings, district: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Contact Email</label>
                                    <input className="w-full border p-2 rounded" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
                                </div>
                                <div className="md:col-span-2">
                                     <label className="text-xs font-bold text-gray-500">Scrolling Notice Text (Marquee)</label>
                                     <input className="w-full border p-2 rounded bg-yellow-50" value={settings.marqueeText || ''} onChange={e => setSettings({...settings, marqueeText: e.target.value})} placeholder="Enter scrolling notice text here..." />
                                </div>
                                
                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                     <label className="text-sm font-bold text-green-800 block mb-2"><i className="fab fa-google-pay mr-1"></i> Tax UPI IDs (Tax-wise Collection)</label>
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                         <div>
                                            <label className="text-xs font-bold text-gray-500">House Tax UPI ID (घरपट्टी)</label>
                                            <input className="w-full border-2 border-orange-200 p-2 rounded bg-orange-50" value={settings.upiIdHouse || ''} onChange={e => setSettings({...settings, upiIdHouse: e.target.value})} placeholder="e.g. house@oksbi" />
                                         </div>
                                         <div>
                                            <label className="text-xs font-bold text-gray-500">Water Tax UPI ID (पाणीपट्टी)</label>
                                            <input className="w-full border-2 border-blue-200 p-2 rounded bg-blue-50" value={settings.upiIdWater || ''} onChange={e => setSettings({...settings, upiIdWater: e.target.value})} placeholder="e.g. water@oksbi" />
                                         </div>
                                         <div>
                                            <label className="text-xs font-bold text-gray-500">Special Water Tax UPI ID (खास पाणीपट्टी)</label>
                                            <input className="w-full border-2 border-purple-200 p-2 rounded bg-purple-50" value={settings.upiIdSpecialWater || ''} onChange={e => setSettings({...settings, upiIdSpecialWater: e.target.value})} placeholder="e.g. special@oksbi" />
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                         {/* Important Links moved to Settings */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gov-primary">External Certificate Links</h3>
                             <div className="flex flex-col gap-2 mb-4 bg-gray-50 p-4 rounded">
                                <input className="border p-2 w-full" placeholder="Link Title (e.g. Birth Certificate)" value={newLink.title || ''} onChange={e => setNewLink({...newLink, title: e.target.value})} />
                                <input className="border p-2 w-full" placeholder="URL (https://...)" value={newLink.url || ''} onChange={e => setNewLink({...newLink, url: e.target.value})} />
                                <input className="border p-2 w-full" placeholder="Description (Brief info about certificate)" value={newLink.description || ''} onChange={e => setNewLink({...newLink, description: e.target.value})} />
                                <button onClick={handleAddLink} className="bg-blue-600 text-white px-4 py-2 rounded font-bold w-full md:w-auto">Add Link</button>
                             </div>
                             <div className="space-y-2">
                                {links.map(l => (
                                    <div key={l.id} className="bg-blue-50 text-blue-800 p-3 rounded flex justify-between items-center border border-blue-100">
                                        <div>
                                            <div className="font-bold">{l.title}</div>
                                            <div className="text-xs text-blue-600">{l.url}</div>
                                            {l.description && <div className="text-xs text-gray-500 mt-1 italic">{l.description}</div>}
                                        </div>
                                        <button type="button" onClick={(e) => deleteLink(e, l.id)} className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-700 ml-2 text-xs">&times;</button>
                                    </div>
                                ))}
                             </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-4 text-gov-primary">Branding (Logo & Slider)</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <img src={settings.logoUrl} className="w-16 h-16 border p-1" />
                                <div className="flex-1">
                                    <FileUpload label="Update Logo" accept="image/*" onFileSelect={(url) => setSettings({...settings, logoUrl: url})} />
                                </div>
                            </div>
                            {/* Added Flag Upload */}
                            <div className="flex items-center gap-4 mb-6 border-t pt-4">
                                <img src={settings.flagUrl || 'https://media.giphy.com/media/l3vRlT2k2L35Cnn5C/giphy.gif'} className="w-16 h-12 border p-1 object-cover" />
                                <div className="flex-1">
                                    <FileUpload label="Update Tiranga (GIF/Image)" accept="image/*" onFileSelect={(url) => setSettings({...settings, flagUrl: url})} />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <label className="font-bold block mb-2">Slider Images</label>
                                <div className="flex gap-2 mb-2 overflow-x-auto">
                                    {settings.sliderImages.map((src, i) => (
                                        <img key={i} src={src} className="w-20 h-12 object-cover border" />
                                    ))}
                                </div>
                                <FileUpload label="Add Slider Image" accept="image/*" onFileSelect={(url) => setSettings({...settings, sliderImages: [...settings.sliderImages, url]})} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Default Overview for other tabs */}
                {activeTab === 'overview' && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
                             <h3 className="text-gray-500 text-sm font-bold">OPEN COMPLAINTS</h3>
                             <p className="text-3xl font-bold">{complaints.filter(c => c.status === 'Open').length}</p>
                         </div>
                         <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                             <h3 className="text-gray-500 text-sm font-bold">TAX COLLECTED (Records)</h3>
                             <p className="text-3xl font-bold">{taxRecords.length}</p>
                         </div>
                         <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                             <h3 className="text-gray-500 text-sm font-bold">TOTAL MEMBERS</h3>
                             <p className="text-3xl font-bold">{members.length}</p>
                         </div>
                     </div>
                )}
            </div>
        </div>
    </div>
  );
};
