/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, LogOut, UserCircle, Edit2, Trash2, Eye, Menu, X, Plus, Check, XCircle, Upload, Video, FileText, Settings } from 'lucide-react';
import './App.css';

// ========================================
// API URL - BACKEND CONNECTION
// ========================================
const API_URL = 'http://localhost:5001/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewDocumentModal, setShowViewDocumentModal] = useState(false);
  const [showAdminApproveModal, setShowAdminApproveModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedCourseIdForChapter, setSelectedCourseIdForChapter] = useState(null);
  const [showChapterView, setShowChapterView] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [documentComments, setDocumentComments] = useState([]);
  const [newDocumentComment, setNewDocumentComment] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [rating, setRating] = useState(5);
 
 
  
  // Documents State
  const [documents, setDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [documentForm, setDocumentForm] = useState({
    title: '',
    category: '',
    content: '',
    image: null
  });
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  
  // User Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    department: '',
    position: '',
    username: '',
    password: '',
    role: '',
    avatar: null
  });
  
  // Courses State
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
 

  // Users State (for admin)
const [users, setUsers] = useState([]);

  // Pending Documents State
  const [pendingDocuments, setPendingDocuments] = useState([]);

  // Form States
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Course Management
  const [courseForm, setCourseForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    content: '',
     image: null,
    chapters: []
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', videoUrl: '', duration: '', videoFile: null, lessonContent: '' });
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  // User Management
  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    username: '', 
    password: '', 
    role: 'user',
    employeeId: '',
    department: '',
    position: ''
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Admin Profile
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  





  // ========================================
  // LOAD DATA FROM BACKEND ON MOUNT
  // ========================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
    
    // Load public data
    loadCourses();
    loadDocuments();
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (currentUser) {
      loadPendingDocuments();
    }
  }, [currentUser]);

  // ========================================
  // API FUNCTIONS
  // ========================================

  // Load Courses
const loadCourses = async () => {
  try {
    const response = await fetch(`${API_URL}/courses`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Transform backend data to frontend format
      const coursePromises = data.map(async (course) => {
        // Load chapters for each course
        let chapters = [];
        try {
          const chaptersResponse = await fetch(`${API_URL}/chapters/course/${course.course_id}`);
            
          const chaptersData = await chaptersResponse.json();
          if (Array.isArray(chaptersData)) {
            chapters = chaptersData.map(ch => ({
            id: ch.content_id,
            title: ch.content_title,
            videoUrl: ch.video_url,
            duration: ch.duration,

            lessonContent: ch.content_text
            }));

          }
        } catch (err) {
          console.error('Error loading chapters:', err);
        }
        
        return {
          id: course.course_id,
          title: course.course_name,
          description: course.description,
          category: course.category,
          author: course.author_name || course.author,
          date: course.start_date ? course.start_date.split('T')[0] : '',
          content: course.description,
          image: course.image,
          chapters: chapters
        };
      });
      
      const transformedCourses = await Promise.all(coursePromises);
      setCourses(transformedCourses);
    }
  } catch (error) {
    console.error('Error loading courses:', error);
    alert('Cannot connect to backend. Is it running on port 5001?');
  }
};
  // Load Documents
  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/documents`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const transformedDocs = data.map(doc => ({
          id: doc.document_id,
          title: doc.document_name,
          category: doc.category,
          author: doc.author_name,
          submittedDate: doc.created_at ? doc.created_at.split('T')[0] : '',
          content: doc.content,
          description: doc.description,
          image: doc.image,
          status: doc.status,
          userId: doc.created_by
        }));
        setDocuments(transformedDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };
  

  // Load Pending Documents (Admin only)
  const loadPendingDocuments = async () => {
    if (currentUser?.role_name !== 'admin') return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/documents/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const transformedDocs = data.map(doc => ({
          id: doc.document_id,
          title: doc.document_name,
          category: doc.category,
          author: doc.author_name,
          authorId: doc.created_by,
          submittedDate: doc.created_at ? doc.created_at.split('T')[0] : '',
          content: doc.content,
          status: doc.status
        }));
        setPendingDocuments(transformedDocs);
      }
    } catch (error) {
      console.error('Error loading pending documents:', error);
    }
  };

  // ========================================
  // LOGIN/LOGOUT
  // ========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setCurrentUser(data.user);
        setShowLoginModal(false);
        setLoginForm({ username: '', password: '' });
        
        // Reload data
        loadCourses();
        loadDocuments();
        
        alert(`Welcome ${data.user.full_name || data.user.username}!`);
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Cannot connect to server. Backend running on port 5001?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentView('home');
    setSelectedCourse(null);
    setShowAdminDropdown(false);
    setPendingDocuments([]);
  };

  // ========================================
  // DOCUMENT FUNCTIONS
  // ========================================
  
  const handleCreateDocument = () => {
    setDocumentForm({
      title: '',
      category: '',
      content: '',
      image: null
    });
    setEditingDocument(null);
    setShowDocumentModal(true);
  };

  const handleSaveDocument = async () => {
    if (!documentForm.title || !documentForm.category || !documentForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const payload = {
        document_name: documentForm.title,
        description: documentForm.content.substring(0, 200),
        content: documentForm.content,
        category: documentForm.category,
        image: documentForm.image
      };

      if (editingDocument) {
        // Update document
        const response = await fetch(`${API_URL}/documents/${editingDocument.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Document updated!');
          loadDocuments();
          setShowDocumentModal(false);
        } else {
          alert(data.message || 'Update failed');
        }
      } else {
        // Create new document
        const response = await fetch(`${API_URL}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Document created! Waiting for admin approval.');
          loadDocuments();
          loadPendingDocuments();
          setShowDocumentModal(false);
        } else {
          alert(data.message || 'Create failed');
        }
      }
    } catch (error) {
      console.error('Save document error:', error);
      alert('Error saving document');
    }
  };

  const handleApproveDocument = async (docId) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/documents/${docId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Document approved and published!');
        loadDocuments();
        loadPendingDocuments();
      } else {
        alert(data.message || 'Approve failed');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Error approving document');
    }
  };

  const handleRejectDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to reject this document?')) {
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/documents/${docId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Document rejected');
        loadPendingDocuments();
      } else {
        alert(data.message || 'Reject failed');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Error rejecting document');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Document deleted');
        loadDocuments();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting document');
    }
  };

 
   // ========================================
// COURSE FUNCTIONS (ADMIN)
// ========================================
const handleSaveCourse = async () => {
  if (!courseForm.title || !courseForm.category || !courseForm.description || !courseForm.content) {
    alert('Please fill in all required fields');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login as admin');
    return;
  }

  try {
    const payload = {
      course_name: courseForm.title,
      course_code: courseForm.title.toUpperCase().replace(/\s+/g, '_'),
      description: courseForm.description,
      category: courseForm.category,
      author: currentUser.full_name || currentUser.username,
      start_date: new Date().toISOString().split('T')[0],
      image: courseForm.image
    };

    // UPDATE
    if (editingCourse?.id) {
      const response = await fetch(`${API_URL}/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert('Course updated!');
        await loadCourses();
        setShowCreateCourseModal(false);
        setEditingCourse(null);
      } else {
        alert(data.message || 'Update failed');
      }

      return;
    }

    // CREATE
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      alert('Course created successfully!');
      await loadCourses();
      setShowCreateCourseModal(false);
      setCourseForm({ title: '', description: '', category: '', content: '', image: null, chapters: [] });
    } else {
      alert(data.message || 'Create failed');
    }

  } catch (error) {
    console.error('Save course error:', error);
    alert('Error saving course');
  }
};
// DELETE COURSE

const handleDeleteCourse = async (courseId) => {
  if (!window.confirm('Are you sure you want to delete this course?')) {
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      alert('Course deleted successfully!');
      loadCourses();
    } else {
      alert(data.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Delete course error:', error);
    alert('Error deleting course');
  }
};

// ========================================
// CHAPTER: ADD (upload video -> create chapter -> update UI)
// ========================================

const handleAddChapter = async () => {
  if (!newChapter.title || !newChapter.duration) {
    alert('Please fill in chapter title and duration');
    return;
  }

  if (!newChapter.videoFile) {
    alert('Please select a video file');
    return;
  }

  if (!editingCourse?.id) {
    alert('Please save/update the course first before adding chapters');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  setIsUploadingVideo(true);

  try {
    // 1) Upload video
    const formData = new FormData();
    formData.append('video', newChapter.videoFile);

    const uploadRes = await fetch(`${API_URL}/upload/video`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.message || 'Failed to upload video');

    const videoUrlFromServer = uploadData.videoUrl; // "/uploads/videos/xxx.mp4"

    // 2) Create chapter
    const chapterData = {
      content_title: newChapter.title,
      content_type: 'video',
      duration: newChapter.duration,
      order_number: (courseForm.chapters?.length || 0) + 1,
      video_url: videoUrlFromServer,
      content_text: newChapter.lessonContent || ''
    };

    const createRes = await fetch(`${API_URL}/chapters/course/${editingCourse.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(chapterData)
    });

    const saved = await createRes.json();
    if (!createRes.ok) throw new Error(saved.message || 'Failed to add chapter');

    // 3) Update UI + ghép host để xem video
    const chapterToAdd = {
      id: saved.content_id,
      title: saved.content_title,
      duration: saved.duration,
      videoUrl: saved.video_url?.startsWith('http')
        ? saved.video_url
        : `http://localhost:5001${saved.video_url}`,
      lessonContent: saved.content_text
    };

    setCourseForm(prev => ({
      ...prev,
      chapters: [...(prev.chapters || []), chapterToAdd]
    }));

    // 4) Reset form
    setNewChapter({
      title: '',
      duration: '',
      videoUrl: '',
      videoFile: null,
      lessonContent: ''
    });

    alert('✅ Chapter added successfully!');
  } catch (err) {
    console.error(err);
    alert('❌ Failed to add chapter: ' + err.message);
  } finally {
    setIsUploadingVideo(false);
  }
};

// ========================================
// CHAPTER: REMOVE (UI + DB + delete video file)
// ========================================

const handleRemoveChapter = async (chapterId) => {
  if (!window.confirm('Bạn có chắc muốn xoá chapter này không?')) return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete failed');

    setCourseForm(prev => ({
      ...prev,
      chapters: (prev.chapters || []).filter(ch => ch.id !== chapterId)
    }));

    alert('✅ Xoá chapter thành công!');
  } catch (err) {
    alert('❌ Lỗi xoá chapter: ' + err.message);
  }
};
const handleEditCourse = (course) => {
  setEditingCourse(course);
  setCourseForm({
    title: course.title,
    description: course.description,
    category: course.category,
    content: course.content,
    image: course.image,
    chapters: course.chapters || []
  });
  setShowCreateCourseModal(true);
};
useEffect(() => {
  if (!selectedCourse?.id) return;

  fetch(`http://localhost:5001/api/feedbacks/course/${selectedCourse.id}`)
    .then(async (res) => {
      const data = await res.json().catch(() => null);

      // debug xem API trả gì
      console.log('📥 feedbacks response:', data);

      // đảm bảo feedbacks luôn là mảng
      setFeedbacks(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      console.error('❌ load feedbacks error:', err);
      setFeedbacks([]);
    });
}, [selectedCourse]);


  // ========================================
  // USER MANAGEMENT (ADMIN)
  // ========================================
  // Load Users (Admin only)
// Load Users (Admin only)
const loadUsers = async () => {
  const token = localStorage.getItem('token');
  if (!token || currentUser?.role_name !== 'admin') return;  // ← ĐỔI: role → role_name

  try {
    console.log('📋 Loading users from backend...');
    
    const response = await fetch(`${API_URL}/users`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Load users failed:', response.status, data);
      return;
    }

    console.log('✅ Loaded users:', data.length);
    setUsers(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('❌ Load users error:', error);
  }
};

// Load data when user logs in
useEffect(() => {
  if (currentUser) {
    loadPendingDocuments();
  }
}, [currentUser]);

// Load users when viewing Account Provisioning
useEffect(() => {
  if (currentUser?.role_name === 'admin' && currentView === 'accountProvisioning') {  // ← ĐỔI: role → role_name
    loadUsers();
  }
}, [currentUser, currentView]);

const handleAddUser = async (e) => {
  e.preventDefault();
  
  if (!userForm.name || !userForm.email || !userForm.username || !userForm.password || !userForm.employeeId) {
    alert('Please fill in all required fields');
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: userForm.name,
        email: userForm.email,
        username: userForm.username,
        password: userForm.password,
        employee_id: userForm.employeeId,
        department: userForm.department,
        position: userForm.position
      })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('User created successfully!');
      setShowAddUserModal(false);
      setUserForm({ 
        name: '', 
        email: '', 
        username: '', 
        password: '', 
        role: 'user', 
        employeeId: '', 
        department: '', 
        position: '' 
      });
      loadUsers();
    } else {
      alert(data.message || 'Create failed');
    }
  } catch (error) {
    console.error('Create user error:', error);
    alert('Error creating user');
  }
};

const handleDeleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user?')) {
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    console.log('🗑️ Deleting user:', userId);
    
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      alert('User deleted successfully!');
      loadUsers();
    } else {
      alert(data.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Delete user error:', error);
    alert('Error deleting user');
  }
};

// ========================================
// FEEDBACK FUNCTIONS
// ========================================
  const handleSubmitFeedback = async () => {
  if (!feedbackContent.trim()) return;

  const token = localStorage.getItem('token');

  await fetch(
    `http://localhost:5001/api/feedbacks/course/${selectedCourse.id}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        content: feedbackContent,
        rating
      })
    }
  );

  setFeedbackContent('');
  setRating(5);

  // reload
  const res = await fetch(
    `http://localhost:5001/api/feedbacks/course/${selectedCourse.id}`
  );
  const data = await res.json();
  setFeedbacks(data);
};


  // ========================================
  // PROFILE MANAGEMENT
  // ========================================
  
  const handleOpenProfile = () => {
    setProfileForm({
      fullName: currentUser.full_name || currentUser.name,
      employeeId: currentUser.employee_id || currentUser.employeeId,
      email: currentUser.email,
      department: currentUser.department_name || currentUser.department,
      position: currentUser.position,
      username: currentUser.username,
      password: '',
      role: currentUser.role_name || currentUser.role,
      avatar: currentUser.avatar
    });
    setShowProfileModal(true);
    setShowUserDropdown(false);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login');
      return;
    }

    try {
      const payload = {
        full_name: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
        position: profileForm.position,
        avatar: profileForm.avatar
      };

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local user
        const updatedUser = { ...currentUser, ...data.user };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowProfileModal(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Error updating profile');
    }
  };

  const openAdminProfile = () => {
    setAdminProfileForm({
      name: currentUser.full_name || currentUser.name,
      email: currentUser.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowAdminProfileModal(true);
    setShowAdminDropdown(false);
  };

  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    
    if (adminProfileForm.newPassword && adminProfileForm.newPassword !== adminProfileForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      const payload = {
        full_name: adminProfileForm.name,
        email: adminProfileForm.email
      };

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update password if provided
        if (adminProfileForm.newPassword) {
          const pwdResponse = await fetch(`${API_URL}/auth/password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              currentPassword: adminProfileForm.currentPassword,
              newPassword: adminProfileForm.newPassword
            })
          });

          const pwdData = await pwdResponse.json();
          if (!pwdData.success) {
            alert(pwdData.message || 'Password update failed');
            return;
          }
        }

        const updatedUser = { ...currentUser, ...data.user };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowAdminProfileModal(false);
        setAdminProfileForm({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update admin profile error:', error);
      alert('Error updating profile');
    }
  };

  // ========================================
  // COMMENT FUNCTIONS (LOCAL ONLY FOR NOW)
  // ========================================
  // ✅ GIỮ LẠI VERSION MỚI NÀY
const handleViewDocument = async (doc) => {
  setSelectedDocument(doc);
  setShowViewDocumentModal(true);
  
  // Load comments from backend
  try {
    const response = await fetch(`${API_URL}/documents/${doc.id}/comments`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      const transformedComments = data.map(comment => ({
        id: comment.comment_id,
        userName: comment.user_name,
        userRole: comment.role_name,
        content: comment.content_text,
        date: new Date(comment.created_at).toLocaleDateString(),
        time: new Date(comment.created_at).toLocaleTimeString()
      }));
      setDocumentComments(transformedComments);
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    setDocumentComments([]);
  }
};

const handleAddDocumentComment = async () => {
  if (!currentUser) {
    alert('Please login to comment');
    return;
  }
  if (!newDocumentComment.trim()) return;

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/documents/${selectedDocument.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content_text: newDocumentComment
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const newComment = {
        id: data.comment.comment_id,
        userName: data.comment.user_name,
        userRole: data.comment.role_name,
        content: data.comment.content_text,
        date: new Date(data.comment.created_at).toLocaleDateString(),
        time: new Date(data.comment.created_at).toLocaleTimeString()
      };
      setDocumentComments([newComment, ...documentComments]);
      setNewDocumentComment('');
    } else {
      alert(data.message || 'Failed to add comment');
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Error adding comment');
  }
};

const handleDeleteDocumentComment = async (commentId) => {
  if (!window.confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/documents/${selectedDocument.id}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      setDocumentComments(documentComments.filter(c => c.id !== commentId));
    } else {
      alert(data.message || 'Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    alert('Error deleting comment');
  }
};
  
  // ========================================
  // CHAPTER COMPLETION (LOCAL TRACKING)
  // ========================================
  
  const handleCompleteChapter = (courseId, chapterId) => {
    // This is local only for demo
    alert(`Chapter ${chapterId} of course ${courseId} marked as complete!`);
  };

  const isChapterCompleted = (courseId, chapterId) => {
    return false; // Local tracking not implemented with backend yet
  };

  const isCourseCompleted = (courseId) => {
    return false; // Local tracking not implemented with backend yet
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <button onClick={() => setCurrentView('home')} className="logo-button">
            <div className="logo-container">
              <img src="/fpt-logo.png" alt="FPT Logo" className="logo-image" />
            </div>
            <div className="logo-text">
              <h1>Knowledge Management</h1>
              <p>FPT Education</p>
            </div>
          </button>

          <nav className="desktop-nav">
            <button 
              onClick={() => setCurrentView('home')} 
              className={`nav-button ${currentView === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentView('courses')} 
              className={`nav-button ${currentView === 'courses' || currentView === 'viewCourse' ? 'active' : ''}`}
            >
              Courses
            </button>

            {currentUser && (
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => {
                    if (currentUser.role_name === 'admin') {
                      setShowAdminDropdown(!showAdminDropdown);
                    } else {
                      setShowUserDropdown(!showUserDropdown);
                    }
                  }}
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.full_name} className="user-avatar-small" />
                  ) : (
                    <UserCircle size={20} />
                  )}
                  <span>{currentUser.full_name || currentUser.username}</span>
                </button>
                
                {showAdminDropdown && currentUser.role_name === 'admin' && (
                  <div className="admin-dropdown">
                    <button onClick={() => { setCurrentView('manageCourse'); setShowAdminDropdown(false); }} className="dropdown-item">
                      <BookOpen size={16} />
                      <span>Manage Courses</span>
                    </button>
                    <button onClick={() => { setCurrentView('accountProvisioning'); setShowAdminDropdown(false); }} className="dropdown-item">
                      <Users size={16} />
                      <span>Account Provisioning</span>
                    </button>
                    <button onClick={() => { setCurrentView('approveDocuments'); setShowAdminDropdown(false); }} className="dropdown-item">
                      <FileText size={16} />
                      <span>Approve Documents ({pendingDocuments.length})</span>
                    </button>
                    <button onClick={() => { openAdminProfile(); }} className="dropdown-item">
                      <Settings size={16} />
                      <span>Manage Profile</span>
                    </button>
                    <button onClick={handleLogout} className="dropdown-item">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}

                {showUserDropdown && currentUser.role_name !== 'admin' && (
                  <div className="admin-dropdown">
                    <button onClick={() => { handleOpenProfile(); }} className="dropdown-item">
                      <Settings size={16} />
                      <span>Manage Profile</span>
                    </button>
                    <button onClick={() => { setCurrentView('courses'); setShowUserDropdown(false); }} className="dropdown-item">
                      <BookOpen size={16} />
                      <span>View Courses</span>
                    </button>
                    <button onClick={() => { setCurrentView('documents'); setShowUserDropdown(false); }} className="dropdown-item">
                      <FileText size={16} />
                      <span>Document Collaboration</span>
                    </button>
                    <button onClick={handleLogout} className="dropdown-item">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!currentUser && (
              <button onClick={() => setShowLoginModal(true)} className="login-button">
                Login
              </button>
            )}
          </nav>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mobile-menu-button">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            <button 
              onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }} 
              className={`mobile-nav-button ${currentView === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setCurrentView('courses'); setIsMobileMenuOpen(false); }} 
              className={`mobile-nav-button ${currentView === 'courses' ? 'active' : ''}`}
            >
              Courses
            </button>
            
            {currentUser && currentUser.role_name === 'admin' && (
              <>
                <button 
                  onClick={() => { setCurrentView('manageCourse'); setIsMobileMenuOpen(false); }} 
                  className={`mobile-nav-button ${currentView === 'manageCourse' ? 'active' : ''}`}
                >
                  Manage Courses
                </button>
                <button 
                  onClick={() => { setCurrentView('accountProvisioning'); setIsMobileMenuOpen(false); }} 
                  className={`mobile-nav-button ${currentView === 'accountProvisioning' ? 'active' : ''}`}
                >
                  Account Provisioning
                </button>
                <button 
                  onClick={() => { setCurrentView('approveDocuments'); setIsMobileMenuOpen(false); }} 
                  className={`mobile-nav-button ${currentView === 'approveDocuments' ? 'active' : ''}`}
                >
                  Approve Documents
                </button>
                <button 
                  onClick={() => { openAdminProfile(); setIsMobileMenuOpen(false); }} 
                  className="mobile-nav-button"
                >
                  Manage Profile
                </button>
              </>
            )}
            
            {currentUser && (
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                className="mobile-nav-button"
              >
                Logout
              </button>
            )}
            
            {!currentUser && (
              <button 
                onClick={() => { setShowLoginModal(true); setIsMobileMenuOpen(false); }} 
                className="mobile-nav-button active"
              >
                Login
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );

  const renderHome = () => (
    <div className="home-container">
      <div className="hero-banner">
        <BookOpen className="hero-icon" />
        <h2>Welcome to FPT Knowledge Management</h2>
        <p>
          Discover, learn, and share knowledge with our comprehensive course library. 
          {currentUser ? ` Welcome back, ${currentUser.full_name || currentUser.username}!` : ' Login to access more features.'}
        </p>
      </div>

      <div className="feature-grid">
        {currentUser?.role_name === 'admin' ? (
          <>
            <div className="feature-card orange" onClick={() => setCurrentView('manageCourse')} style={{ cursor: 'pointer' }}>
              <BookOpen className="feature-icon" />
              <h3>Manage Courses</h3>
              <p>Create, edit, and manage courses in the system.</p>
              <button onClick={(e) => { e.stopPropagation(); setCurrentView('manageCourse'); }} className="feature-button">
                Manage Courses →
              </button>
            </div>
            
            <div className="feature-card blue" onClick={() => setCurrentView('accountProvisioning')} style={{ cursor: 'pointer' }}>
              <Users className="feature-icon" />
              <h3>Account Provisioning</h3>
              <p>Manage user accounts and permissions.</p>
              <button onClick={(e) => { e.stopPropagation(); setCurrentView('accountProvisioning'); }} className="feature-button">
                Manage Users →
              </button>
            </div>
            
            <div className="feature-card green" onClick={() => setCurrentView('approveDocuments')} style={{ cursor: 'pointer' }}>
              <FileText className="feature-icon" />
              <h3>Approve Documents</h3>
              <p>Review and approve pending documents ({pendingDocuments.length} pending)</p>
              <button onClick={(e) => { e.stopPropagation(); setCurrentView('approveDocuments'); }} className="feature-button">
                Review Documents →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="feature-card orange" onClick={() => setCurrentView('courses')} style={{ cursor: 'pointer' }}>
              <BookOpen className="feature-icon" />
              <h3>View Courses</h3>
              <p>Explore our extensive course library.</p>
              <button onClick={(e) => { e.stopPropagation(); setCurrentView('courses'); }} className="feature-button">
                View Courses →
              </button>
            </div>
            
            <div className="feature-card blue" onClick={() => setCurrentView('documents')} style={{ cursor: 'pointer' }}>
              <Users className="feature-icon" />
              <h3>Document Collaboration</h3>
              <p>Create and share documents with the community.</p>
              <button onClick={(e) => { e.stopPropagation(); setCurrentView('documents'); }} className="feature-button">
                Go to Documents →
              </button>
            </div>
            
            <div 
              className="feature-card green" 
              onClick={() => currentUser ? handleOpenProfile() : setShowLoginModal(true)} 
              style={{ cursor: 'pointer' }}
            >
              <Settings className="feature-icon" />
              <h3>Manage Profile</h3>
              <p>Update your personal information.</p>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  currentUser ? handleOpenProfile() : setShowLoginModal(true);
                }} 
                className="feature-button"
              >
                View Profile →
              </button>
            </div>
          </>
        )}
      </div>

      <div className="stats-section" style={{ marginTop: '3rem', padding: '2rem', background: 'white', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '1rem' }}>📊 System Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{courses.length}</p>
            <p>Total Courses</p>
          </div>
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#48bb78' }}>{documents.length}</p>
            <p>Total Documents</p>
          </div>
          {currentUser?.role_name === 'admin' && (
            <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ed8936' }}>{pendingDocuments.length}</p>
              <p>Pending Approval</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="courses-container">
      <div className="search-box">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search courses by title, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <p className="search-results">Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="course-grid">
        {filteredCourses.map(course => {
          const isCompleted = isCourseCompleted(course.id);
          
          return (
  <div key={course.id} className={`course-card ${isCompleted ? 'completed' : ''}`}>
    {course.image ? (
      <div 
        className="course-header"
        style={{
          backgroundImage: `url(${course.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '200px'
        }}
      >
        {isCompleted && (
          <div className="course-completed-badge-small">
            <Check size={16} />
          </div>
        )}
      </div>
    ) : (
      <div className="course-header">
        <BookOpen className="course-icon" />
        {isCompleted && (
          <div className="course-completed-badge-small">
            <Check size={16} />
          </div>
        )}
      </div>
    )}
              <div className="course-body">
                <span className="course-category">{course.category}</span>
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span>By {course.author}</span>
                  <span>{course.date}</span>
                </div>
                <div className="course-actions">
                  <button
                    onClick={() => { setSelectedCourse(course); setCurrentView('viewCourse'); }}
                    className="btn btn-primary"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  {currentUser?.role_name === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="btn btn-secondary"
                        title="Edit course"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="btn btn-danger"
                        title="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="empty-state">
          <Search className="empty-icon" />
          <p className="empty-title">No courses found</p>
          <p className="empty-text">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );

  const renderViewCourse = () => (
  <div className="view-course-container">
    <button onClick={() => setCurrentView('courses')} className="back-button">
      ← Back to Courses
    </button>

    <div className="course-detail-card">
      <div
        className="course-detail-header"
        style={{
          backgroundImage: selectedCourse?.image
            ? `url(${selectedCourse.image})`
            : 'linear-gradient(135deg, #FF7F50 0%, #FF6347 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {!selectedCourse?.image && <BookOpen className="course-detail-icon" />}
      </div>

      <div className="course-detail-body">
        <span className="course-category-large">{selectedCourse?.category}</span>
        <h1>{selectedCourse?.title}</h1>

        <div className="course-detail-meta">
          <span>By {selectedCourse?.author}</span>
          <span>•</span>
          <span>{selectedCourse?.date}</span>
        </div>

        <div className="course-content">
          <p className="course-intro">{selectedCourse?.description}</p>

          <div className="course-content-box">
            <h2>Course Content</h2>
            <p>{selectedCourse?.content}</p>

            {selectedCourse?.chapters && selectedCourse.chapters.length > 0 && (
              <div className="chapters-list">
                <h3>Chapters</h3>

                {selectedCourse.chapters.map((chapter, index) => {
                  const isCompleted = isChapterCompleted(selectedCourse.id, chapter.id);

                  return (
                    <div
                      key={chapter.id}
                      className={`chapter-item clickable ${isCompleted ? 'completed' : ''}`}
                      onClick={() => {
                        setSelectedChapter(chapter);
                        setSelectedCourseIdForChapter(selectedCourse.id);
                        setShowChapterView(true);
                      }}
                    >
                      <Video size={20} />

                      <div className="chapter-info">
                        <span className="chapter-number">Chapter {index + 1}:</span>
                        <span className="chapter-title">{chapter.title}</span>
                      </div>

                      <div className="chapter-meta">
                        <span className="chapter-duration">{chapter.duration}</span>
                        {isCompleted && (
                          <div className="chapter-check-badge">
                            <Check size={18} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ✅ FEEDBACK */}
<div className="course-feedback-section">
  <div className="feedback-title-row">
    <h3>Feedback</h3>
    <p className="feedback-subtitle">Share your thoughts to help improve this course</p>
  </div>

  {currentUser ? (
    <div className="feedback-form">
      <textarea
        value={feedbackContent}
        onChange={(e) => setFeedbackContent(e.target.value)}
        placeholder="Write your feedback..."
        className="feedback-textarea"
      />

      <div className="feedback-actions">
        {/* Clickable star rating */}
        <div className="star-rating" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              className={`star ${Number(rating) >= v ? "active" : ""}`}
              onClick={() => setRating(String(v))}
              aria-label={`${v} star`}
              title={`${v} star`}
            >
              ★
            </button>
          ))}
          <span className="star-text">{rating}/5</span>
        </div>

        <button onClick={handleSubmitFeedback} className="btn-submit-feedback">
          Submit feedback
        </button>
      </div>
    </div>
  ) : (
    <p className="feedback-login-hint">
      Please{" "}
      <button onClick={() => setShowLoginModal(true)} className="link-button">
        sign in
      </button>{" "}
      to submit feedback.
    </p>
  )}

  <hr />

  {/* Feedback list */}
  {Array.isArray(feedbacks) && feedbacks.length > 0 ? (
    <div className="feedback-list">
      {feedbacks.map((fb) => {
        const rawDate = fb.created_at || fb.createdAt || fb.created_date || fb.createdDate;
        const dateText = rawDate
          ? new Date(rawDate).toLocaleDateString("en-GB") // dd/mm/yyyy
          : "";

        return (
          <div key={fb.id} className="feedback-item">
            <div className="feedback-item-header">
              <div className="feedback-user">
                <span className="feedback-avatar">
                  {(fb.full_name || fb.fullName || "U").trim().charAt(0).toUpperCase()}
                </span>

                <div className="feedback-user-meta">
                  <b className="feedback-name">{fb.full_name || fb.fullName}</b>
                  {dateText ? <span className="feedback-date">{dateText}</span> : null}
                </div>
              </div>

              <div className="feedback-rating-chip" aria-label={`Rating ${fb.rating} out of 5`}>
                <span className="chip-star">★</span>
                <span>{fb.rating}</span>
              </div>
            </div>

            <p className="feedback-content">{fb.content}</p>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="feedback-empty">No feedback yet.</p>
  )}
</div>

               
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const renderManageCourse = () => (
    <div className="manage-course-container">
      <div className="page-header">
        <h2>Manage Courses</h2>
        <button 
          onClick={() => {
            setEditingCourse(null);
            setCourseForm({ title: '', description: '', category: '', content: '', chapters: [] });
            setShowCreateCourseModal(true);
          }} 
          className="btn btn-primary"
        >
          <Plus size={20} />
          Create Course
        </button>
      </div>

      <div className="course-list">
        {courses.map(course => (
          <div key={course.id} className="course-list-item">
            <div className="course-list-info">
              <div className="course-list-header">
                <h3>{course.title}</h3>
                <span className="course-category-badge">{course.category}</span>
              </div>
              <p>{course.description}</p>
              <div className="course-list-meta">
                <span>By {course.author}</span>
                <span>•</span>
                <span>{course.date}</span>
                {course.chapters && <span>• {course.chapters.length} chapters</span>}
              </div>
            </div>
            <div className="course-list-actions">
              <button onClick={() => handleEditCourse(course)} className="btn btn-secondary">
                <Edit2 size={16} />
                Edit
              </button>
              <button onClick={() => handleDeleteCourse(course.id)} className="btn btn-danger">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

     const renderAccountProvisioning = () => (
  <div className="account-provisioning-container">
    <div className="page-header">
      <h2>Account Provisioning</h2>
      <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary">
        <Plus size={20} />
        Add User
      </button>
    </div>

    <div className="provisioning-grid">
      {/* USERS */}
      <div className="provisioning-section">
        <h3>Users</h3>

        <div className="user-list">
          {users.length === 0 ? (
            <p style={{ color: "#666" }}>No users found</p>
          ) : (
            users.map((user) => {
              const isAdmin = user.role_name === "admin";

              return (
                <div key={user.user_id} className="user-item">
                  <div className="user-avatar">
                    <UserCircle size={40} />
                  </div>

                  <div className="user-info">
                    <h4>{user.full_name}</h4>
                    <p className="user-email">{user.email}</p>
                    <p className="user-detail">ID: {user.employee_id || "N/A"}</p>
                    <p className="user-detail">
                      {(user.department_name || "N/A")} • {user.position || "N/A"}
                    </p>
                  </div>

                  {/* Admin: KHÔNG HIỆN NÚT XOÁ */}
                  {!isAdmin && (
                    <button
                      onClick={() => handleDeleteUser(user.user_id)}
                      className="btn-icon-danger"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ROLES */}
      <div className="provisioning-section">
        <h3>Roles & Permissions</h3>

        <div className="role-list">
          {users.length === 0 ? (
            <p style={{ color: "#666" }}>No users found</p>
          ) : (
            users.map((user) => {
              const isAdmin = user.role_name === "admin";

              return (
                <div key={`role-${user.user_id}`} className="role-item">
                  <div className="role-user">
                    <UserCircle size={24} />
                    <span>{user.full_name}</span>
                  </div>

                  <select
                    value={user.role_name}
                    onChange={(e) => handleUpdateUserRole(user.user_id, e.target.value)}
                    className="role-select"
                    disabled={isAdmin}
                  >
                    <option value="user">user</option>
                    {/* Admin vẫn giữ admin */}
                    {isAdmin && <option value="admin">admin</option>}
                  </select>

                  <span className={`role-badge role-${user.role_name}`}>
                    {user.role_name}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  </div>
);





  const renderApproveDocuments = () => (
    <div className="approve-documents-container">
      <div className="page-header">
        <h2>Approve Documents</h2>
        <p className="page-subtitle">Review and approve pending documents</p>
      </div>

      <div className="documents-list">
        {pendingDocuments.filter(doc => doc.status === 'pending').length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <p className="empty-title">No pending documents</p>
            <p className="empty-text">All documents have been reviewed</p>
          </div>
        ) : (
          pendingDocuments.filter(doc => doc.status === 'pending').map(doc => (
            <div key={doc.id} className="document-item">
              <div className="document-info">
                <div className="document-header">
                  <FileText size={24} />
                  <div>
                    <h3>{doc.title}</h3>
                    <span className="document-category">{doc.category}</span>
                  </div>
                </div>
                <div className="document-meta">
                  <span>Submitted by: <strong>{doc.author}</strong></span>
                  <span>•</span>
                  <span>Date: {doc.submittedDate}</span>
                  <span>•</span>
                  <span className={`status-badge status-${doc.status}`}>{doc.status}</span>
                </div>
              </div>
              <div className="document-actions">
                <button 
                  onClick={() => { setSelectedDocument(doc); setShowAdminApproveModal(true); }}
                  className="btn btn-primary"
                >
                  <Eye size={16} />
                  View
                </button>
              </div>
            </div>
          ))
        )}

        {pendingDocuments.filter(doc => doc.status !== 'pending').length > 0 && (
          <div className="reviewed-section">
            <h3>Reviewed Documents</h3>
            {pendingDocuments.filter(doc => doc.status !== 'pending').map(doc => (
              <div key={doc.id} className="document-item reviewed">
                <div className="document-info">
                  <div className="document-header">
                    <FileText size={24} />
                    <div>
                      <h4>{doc.title}</h4>
                      <span className="document-category">{doc.category}</span>
                    </div>
                  </div>
                  <div className="document-meta">
                    <span>By: {doc.author}</span>
                    <span>•</span>
                    <span className={`status-badge status-${doc.status}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDocuments = () => {
    const userDocuments = documents.filter(doc => doc.status === 'approved');
    const myDocuments = documents.filter(doc => doc.userId === currentUser?.user_id);
    const filteredDocs = userDocuments.filter(doc => 
      doc.title.toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(documentSearchTerm.toLowerCase())
    );

    return (
      <div className="documents-container">
        <div className="page-header">
          <h2>Document Collaboration</h2>
          <p className="page-subtitle">Share and collaborate on documents</p>
          {currentUser && (
            <button onClick={handleCreateDocument} className="btn btn-primary">
              <Plus size={16} />
              Create Document
            </button>
          )}
        </div>

        <div className="search-box">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search documents..."
              value={documentSearchTerm}
              onChange={(e) => setDocumentSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <p className="search-results">Found {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</p>
        </div>

        {myDocuments.length > 0 && (
          <div className="my-documents-section">
            <h3>My Documents</h3>
            <div className="documents-grid">
              {myDocuments.map(doc => (
                <div key={doc.id} className="document-card">
                  <div className="document-header-card">
                    <FileText size={24} />
                    <span className={`status-badge status-${doc.status}`}>{doc.status}</span>
                  </div>
                  <h3>{doc.title}</h3>
                  <p className="document-category">{doc.category}</p>
                  <p className="document-preview">{doc.content.substring(0, 100)}...</p>
                  <div className="document-meta">
                    <span>By: {doc.author}</span>
                    <span>•</span>
                    <span>{doc.submittedDate}</span>
                  </div>
                  <div className="document-card-actions">
                    <button onClick={() => handleViewDocument(doc)} className="btn btn-sm btn-secondary">
                      <Eye size={14} />
                      View
                    </button>
                    {doc.status === 'pending' && (
                      <>
                        <button onClick={() => handleEditDocument(doc)} className="btn btn-sm btn-primary">
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button onClick={() => handleDeleteDocument(doc.id)} className="btn btn-sm btn-danger">
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="all-documents-section">
          <h3>All Documents</h3>
          <div className="documents-grid">
            {filteredDocs.length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-icon" />
                <p className="empty-title">No documents found</p>
                <p className="empty-text">Try adjusting your search or create a new document</p>
              </div>
            ) : (
              filteredDocs.map(doc => (
                <div key={doc.id} className="document-card" onClick={() => handleViewDocument(doc)} style={{ cursor: 'pointer' }}>
                  <div className="document-header-card">
                    <FileText size={24} />
                  </div>
                  {doc.image && (
                    <img src={doc.image} alt={doc.title} className="document-image" />
                  )}
                  <h3>{doc.title}</h3>
                  <p className="document-category">{doc.category}</p>
                  <p className="document-preview">{doc.content.substring(0, 100)}...</p>
                  <div className="document-meta">
                    <span>By: {doc.author}</span>
                    <span>•</span>
                    <span>{doc.submittedDate}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleViewDocument(doc); }} className="feature-button">
                    Read More →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {renderHeader()}
      
      <main className="main-content">
        {currentView === 'home' && renderHome()}
        {currentView === 'courses' && renderCourses()}
        {currentView === 'viewCourse' && renderViewCourse()}
        {currentView === 'manageCourse' && renderManageCourse()}
        {currentView === 'accountProvisioning' && renderAccountProvisioning()}
        {currentView === 'approveDocuments' && renderApproveDocuments()}
        {currentView === 'documents' && renderDocuments()}
      </main>

      {/* All Modals */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Login to FPT Knowledge</h2>
            <form onSubmit={handleLogin} className="modal-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="form-input"
                  placeholder=""
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="form-input"
                  placeholder=""
                  required
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
               
              </p>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Login</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateCourseModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="form-input"
                  placeholder="Enter course title"
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Web Development, Design, Programming"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Brief description of the course"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Course Content *</label>
                <textarea
                  value={courseForm.content}
                  onChange={(e) => setCourseForm({ ...courseForm, content: e.target.value })}
                  className="form-textarea"
                  placeholder="Detailed course content and materials"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Course Image (Optional)</label>
                <div className="file-upload-box">
                  <Upload size={24} />
                  <p>Upload course cover image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCourseForm({ ...courseForm, image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="file-input"
                    id="course-image-upload"
                  />
                  <label htmlFor="course-image-upload" className="file-upload-label">
                    Choose Image
                  </label>
                  {courseForm.image && (
                    <div style={{ marginTop: '1rem' }}>
                      <img 
                        src={courseForm.image} 
                        alt="Course preview" 
                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="chapters-section">
                <h3>Course Chapters </h3>
                
                {courseForm.chapters && courseForm.chapters.length > 0 && (
                  <div className="chapters-list-edit">
                   {courseForm.chapters.map((chapter, index) => (
                    <div key={chapter.id || index} className="chapter-item-edit">
                       <div className="chapter-number-badge">{index + 1}</div>
                        <div className="chapter-info-edit">
                          <strong>{chapter.title}</strong>
                          <span className="chapter-duration-small">{chapter.duration}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveChapter(chapter.id)}
                          className="btn-icon-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="add-chapter-form">
                  <h4>Add Chapter</h4>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Chapter Title *</label>
                      <input
                        type="text"
                        value={newChapter.title}
                        onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                        className="form-input"
                        placeholder="e.g., Introduction to React"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration *</label>
                      <input
                        type="text"
                        value={newChapter.duration}
                        onChange={(e) => setNewChapter({ ...newChapter, duration: e.target.value })}
                        className="form-input"
                        placeholder="e.g., 10:30"
                      />
                    </div>
                  </div>

                  <div className="form-group">
              
                    <label>Upload Video</label>
                    <div className="file-upload-box">
                      <Upload size={24} />
                      <p>Upload video from your computer</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setNewChapter({ ...newChapter, videoFile: file });
                        }}
                        className="file-input"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="file-upload-label">
                        {newChapter.videoFile ? newChapter.videoFile.name : 'Choose Video File'}
                      </label>
                      {newChapter.videoFile && (
                        <p className="file-selected">Selected: {newChapter.videoFile.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Lesson Content</label>
                    <textarea
                      value={newChapter.lessonContent}
                      onChange={(e) => setNewChapter({ ...newChapter, lessonContent: e.target.value })}
                      className="form-textarea"
                      placeholder="Detailed lesson content and materials..."
                      rows="4"
                    />
                  </div>
                      <button 
                         type="button" 
                          onClick={handleAddChapter} 
                           className="btn btn-secondary"
                             disabled={isUploadingVideo}
                              >
                            {isUploadingVideo ? (
                                <>⏳ Uploading video...</>
                               ) : (
                                <>
                            <Plus size={16} />
                              Add Chapter
                                  </>
                                )}
                          </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleSaveCourse} className="btn btn-primary">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourseForm({ title: '', description: '', category: '', content: '', chapters: [] });
                    setEditingCourse(null);
                    setShowCreateCourseModal(false);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New User </h2>
            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    value={userForm.employeeId}
                    onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Department</label>
                  <input
                    type="text"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Position</label>
                  <input
                    type="text"
                    value={userForm.position}
                    onChange={(e) => setUserForm({ ...userForm, position: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

                <div className="form-group flex-1">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                   <label>Password *</label>
               <div style={{ position: 'relative' }}>
                 <input
                    type={showPassword ? "text" : "password"}
                     value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                     className="form-input"
                        required
                        />
                      <button
                       type="button"
                         onClick={() => setShowPassword(!showPassword)}
                               style={{
                                position: 'absolute',
                               right: '10px',
                               top: '50%',
                                transform: 'translateY(-50%)',
                                 background: 'none',
                                 border: 'none',
                                  cursor: 'pointer',
                                   fontSize: '0.9rem'
                                  }}
                                >
                            {showPassword ? '🙈' : '👁️'}
                          </button>
                          </div>
                         </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="form-select"
                >
                  <option value="user">User</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Add User</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setUserForm({ name: '', email: '', username: '', password: '', role: 'user', employeeId: '', department: '', position: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdminProfileModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Manage Admin Profile</h2>
            <form onSubmit={handleUpdateAdminProfile} className="modal-form">
              <div className="profile-section">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={adminProfileForm.name}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                    className="form-input"
                    placeholder={currentUser.full_name || currentUser.name}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={adminProfileForm.email}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                    className="form-input"
                    placeholder={currentUser.email}
                  />
                </div>
              </div>

              <div className="profile-section">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={adminProfileForm.currentPassword}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, currentPassword: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={adminProfileForm.newPassword}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, newPassword: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={adminProfileForm.confirmPassword}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, confirmPassword: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Update Profile</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminProfileModal(false);
                    setAdminProfileForm({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdminApproveModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => {setShowAdminApproveModal(false); setSelectedDocument(null);}}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Document</h2>
              <button 
                onClick={() => {setShowAdminApproveModal(false); setSelectedDocument(null);}} 
                className="close-button close-button-orange"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="document-detail-view">
                <div className="form-group">
                  <label>Title</label>
                  <div className="document-detail-title">{selectedDocument.title}</div>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <span className="document-category-large">{selectedDocument.category}</span>
                </div>

                <div className="form-group">
                  <label>Author</label>
                  <div className="document-detail-text">{selectedDocument.author}</div>
                </div>

                <div className="form-group">
                  <label>Submitted Date</label>
                  <div className="document-detail-text">{selectedDocument.submittedDate}</div>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <div className="document-detail-content">
                    {selectedDocument.content}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  handleApproveDocument(selectedDocument.id);
                  setShowAdminApproveModal(false);
                  setSelectedDocument(null);
                }}
                className="btn btn-success"
              >
                <Check size={16} />
                Approve
              </button>
              <button
                onClick={() => {
                  handleRejectDocument(selectedDocument.id);
                  setShowAdminApproveModal(false);
                  setSelectedDocument(null);
                }}
                className="btn btn-danger"
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showChapterView && selectedChapter && (
        <div className="modal-overlay" onClick={() => { setShowChapterView(false); setSelectedChapter(null); setSelectedCourseIdForChapter(null); }}>
          <div className="modal modal-chapter" onClick={(e) => e.stopPropagation()}>
            <div className="chapter-view-header">
              <h2>{selectedChapter.title}</h2>
              <div className="chapter-header-actions">
                {currentUser && selectedCourseIdForChapter && 
                 isChapterCompleted(selectedCourseIdForChapter, selectedChapter.id) && (
                  <div className="chapter-completed-badge">
                    <Check size={20} />
                    <span>Completed</span>
                  </div>
                )}
                <button 
                  onClick={() => { setShowChapterView(false); setSelectedChapter(null); setSelectedCourseIdForChapter(null); }}
                  className="close-modal-btn"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="chapter-view-body">
              <div className="video-section">
                <div className="video-player">
                  {selectedChapter.videoFile || selectedChapter.videoUrl ? (
                    <video 
                      controls 
                      className="video-element"
                      poster=""
                      onEnded={() => {
                        if (currentUser && selectedCourseIdForChapter) {
                          handleCompleteChapter(selectedCourseIdForChapter, selectedChapter.id);
                        }
                      }}
                    >
                      {selectedChapter.videoFile && (
                        <source src={URL.createObjectURL(selectedChapter.videoFile)} type="video/mp4" />
                      )}
                     {selectedChapter.videoUrl && (
                       <source
                       src={
                       selectedChapter.videoUrl.startsWith('http')
                       ? selectedChapter.videoUrl
                       : `http://localhost:5001${selectedChapter.videoUrl}`
                         }
                       type="video/mp4"
                           />
                        )}
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="no-video">
                      <Video size={48} />
                      <p>No video available for this chapter</p>
                    </div>
                  )}
                </div>
                
                {currentUser && selectedCourseIdForChapter && 
                 !isChapterCompleted(selectedCourseIdForChapter, selectedChapter.id) && (
                  <button 
                    onClick={() => handleCompleteChapter(selectedCourseIdForChapter, selectedChapter.id)}
                    className="btn btn-success btn-complete-chapter"
                  >
                    <Check size={16} />
                    Mark as Complete
                  </button>
                )}

              </div>

              <div className="lesson-content-section">
                <h3>Lesson Content</h3>
                <div className="lesson-content-text">
                  {selectedChapter.content_text || 'No lesson content available yet.'}
                </div>
              </div>

              <div className="comments-section">
             
           </div>
            </div>
          </div>
        </div>
      )}

      {showDocumentModal && (
        <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDocument ? 'Edit Document' : 'Create Document'}</h2>
              <button onClick={() => setShowDocumentModal(false)} className="close-button">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  className="form-input"
                  placeholder="Enter document title"
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  value={documentForm.category}
                  onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Programming, Design, Business"
                />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={documentForm.content}
                  onChange={(e) => setDocumentForm({ ...documentForm, content: e.target.value })}
                  className="form-textarea"
                  placeholder="Write your document content here..."
                  rows="10"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveDocument} className="btn btn-primary">
                {editingDocument ? 'Update' : 'Submit for Approval'}
              </button>
              <button onClick={() => setShowDocumentModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewDocumentModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowViewDocumentModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDocument.title}</h2>
              <button onClick={() => setShowViewDocumentModal(false)} className="close-button">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="document-details">
                <div className="document-meta-full">
                  <span className="document-category-badge">{selectedDocument.category}</span>
                  <span>By: <strong>{selectedDocument.author}</strong></span>
                  <span>•</span>
                  <span>Submitted: {selectedDocument.submittedDate}</span>
                </div>
                {selectedDocument.image && (
                  <img src={selectedDocument.image} alt={selectedDocument.title} className="document-image-full" />
                )}
                <div className="document-content-full">
                  <p>{selectedDocument.content}</p>
                </div>
              </div>

              <div className="comments-section" style={{ marginTop: '2rem' }}>
                <h3>Comments</h3>
                {currentUser && (
                  <div className="add-comment-form">
                    <textarea
                      value={newDocumentComment}
                      onChange={(e) => setNewDocumentComment(e.target.value)}
                      className="comment-input"
                      placeholder="Add a comment..."
                      rows="3"
                    />
                    <button onClick={handleAddDocumentComment} className="btn btn-primary btn-sm">
                      <Plus size={14} />
                      Post Comment
                    </button>
                  </div>
                )}
                <div className="comments-list">
                  {documentComments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  ) : (
                    documentComments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-user">
                            <UserCircle size={16} />
                            <span>{comment.userName}</span>
                            <span className={`user-role-badge role-${comment.userRole}`}>
                              {comment.userRole}
                            </span>
                          </div>
                          <div className="comment-meta">
                            <span>{comment.date} {comment.time}</span>
                            {(currentUser?.role_name === 'admin' || currentUser?.full_name === comment.userName) && (
                              <button
                                onClick={() => handleDeleteDocumentComment(comment.id)}
                                className="comment-delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && currentUser && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="close-button">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-avatar-section">
                <div className="avatar-display">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="Avatar" className="avatar-large" />
                  ) : (
                    <UserCircle size={80} />
                  )}
                </div>
                <div className="form-group">
                  <label>Upload Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfileForm({ ...profileForm, avatar: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    value={profileForm.employeeId}
                    className="form-input"
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Position</label>
                  <input
                    type="text"
                    value={profileForm.position}
                    onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="form-input"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <input
                  type="text"
                  value={profileForm.role}
                  className="form-input"
                  disabled
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveProfile} className="btn btn-primary">
                Save Changes
              </button>
              <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 FPT Education. All rights reserved.</p>
          <p className="footer-subtitle">Knowledge Management System </p>
        </div>
      </footer>
    </div>
  );

}
export default App;