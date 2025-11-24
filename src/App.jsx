import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Cloud,
  Trash2,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  RefreshCw,
  CheckCircle,
  Shield,
  Settings,
  Filter,
  HardDrive,
  LogOut,
  AlertTriangle,
  Loader2,
  Key,
  Save,
  X,
  HelpCircle,
  Terminal
} from 'lucide-react';

// --- CONFIGURATION ---
const API_KEY = ''; // Optional
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.file';

/**
 * UTILITY: Load Google Scripts Dynamically
 */
const useGoogleScripts = () => {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  useEffect(() => {
    const loadScript = (src, onLoad) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      document.body.appendChild(script);
      return script;
    };

    const script1 = loadScript('https://apis.google.com/js/api.js', () => {
      window.gapi.load('client', () => setGapiLoaded(true));
    });
    const script2 = loadScript('https://accounts.google.com/gsi/client', () => {
      setGisLoaded(true);
    });

    return () => {
      if (document.body.contains(script1)) document.body.removeChild(script1);
      if (document.body.contains(script2)) document.body.removeChild(script2);
    };
  }, []);

  return { gapiLoaded, gisLoaded };
};

/**
 * MOCK DATA GENERATOR (Fallback)
 */
const generateMockData = () => {
  const fileTypes = [
    { type: 'image/jpeg', icon: ImageIcon, ext: 'jpg' },
    { type: 'application/pdf', icon: FileText, ext: 'pdf' },
    { type: 'video/mp4', icon: Video, ext: 'mp4' },
    { type: 'application/zip', icon: File, ext: 'zip' },
  ];

  const duplicateSets = [
    { name: 'Vacation_Bali_2023', count: 3, size: 4500000, type: 0 },
    { name: 'Q4_Financial_Report_Draft', count: 2, size: 1200000, type: 1 },
    { name: 'Project_Alpha_Backup', count: 4, size: 154000000, type: 3 },
    { name: 'IMG_20240101_120000', count: 2, size: 3200000, type: 0 },
  ];

  let files = [];
  let idCounter = 1;

  duplicateSets.forEach(set => {
    const fType = fileTypes[set.type];
    const originalDate = new Date();
    originalDate.setDate(originalDate.getDate() - Math.floor(Math.random() * 300));

    for (let i = 0; i < set.count; i++) {
      const isOriginal = i === 0;
      const fileDate = new Date(originalDate);
      if (!isOriginal) fileDate.setMinutes(fileDate.getMinutes() + Math.floor(Math.random() * 1000));

      files.push({
        id: `mock_file_${idCounter++}`,
        name: `${set.name}.${fType.ext}`,
        mimeType: fType.type,
        size: set.size,
        createdTime: fileDate.toISOString(),
        thumbnailLink: null,
        hash: `mock_hash_${set.name}`,
        group: set.name
      });
    }
  });
  return files;
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Date';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

/**
 * COMPONENT: Settings Modal
 */
const SettingsModal = ({ isOpen, onClose, clientId, setClientId, manualToken, setManualToken }) => {
  const [tempId, setTempId] = useState(clientId || '');
  const [tempToken, setTempToken] = useState(manualToken || '');

  if (!isOpen) return null;

  const handleSave = () => {
    setClientId(tempId);
    setManualToken(tempToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            App Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Client ID Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Option A: Google Client ID</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={tempId}
                onChange={(e) => setTempId(e.target.value)}
                placeholder="7123456789-abcdefg..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Best for localhost or deployed apps. <br />
              <span className="text-red-500">Note: Will likely fail in this preview window due to "blob" security restrictions.</span>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">OR</span>
            </div>
          </div>

          {/* Manual Token Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              Option B: Manual Access Token
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Recommended for Preview</span>
            </label>
            <div className="relative">
              <Terminal className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                placeholder="Paste token starting with 'ya29...' from OAuth Playground"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm h-24 resize-none"
              />
            </div>
            <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold mb-1">How to get a token:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noreferrer" className="text-indigo-600 underline">OAuth Playground</a></li>
                <li>Select <strong>Drive API v3</strong> & Authorize</li>
                <li>Click <strong>Exchange authorization code for tokens</strong></li>
                <li>Copy the <strong>Access Token</strong> (expires in 1hr)</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 mt-auto">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENT: Intro Screen
 */
const IntroScreen = ({ onStartDemo, onLogin, isRealReady, user, clientId, manualToken, onOpenSettings }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500">
    <div className="bg-indigo-100 p-6 rounded-full mb-6">
      <Cloud className="w-16 h-16 text-indigo-600" />
    </div>
    <h1 className="text-4xl font-bold text-slate-800 mb-4">Clean Up Your Drive</h1>
    <p className="text-slate-500 max-w-md mb-8 text-lg">
      Scan your Google Drive for duplicate files based on MD5 checksums, reclaim space, and organize your digital life.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      {!user ? (
        <>
          <button
            onClick={onStartDemo}
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Try Demo Mode
          </button>

          {clientId || manualToken ? (
            <button
              onClick={onLogin}
              disabled={!isRealReady && !manualToken}
              className={`flex-1 font-semibold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${(isRealReady || manualToken)
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
            >
              {(isRealReady || manualToken) ? <HardDrive className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              {manualToken ? 'Connect (Manual)' : (isRealReady ? 'Connect Drive' : 'Loading API...')}
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" />
              Configure Auth
            </button>
          )}
        </>
      ) : (
        <div className="w-full">
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-4 border border-green-200 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Logged in as {user.name || 'User'}
          </div>
          <button
            onClick={onStartDemo}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Scan My Drive Now
          </button>
        </div>
      )}
    </div>

    {!clientId && !manualToken && (
      <div className="mt-8 p-4 bg-orange-50 text-orange-800 text-sm rounded-lg max-w-lg border border-orange-200 flex items-start gap-3 text-left">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Setup Required:</strong> Click "Configure Auth" to connect your Google Account.
        </div>
      </div>
    )}
  </div>
);

/**
 * COMPONENT: Scanning Animation
 */
const ScanningScreen = ({ progress, currentFile, status }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
    <div className="relative w-48 h-48 mb-8">
      <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
      <div
        className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"
        style={{ animationDuration: '1.5s' }}
      ></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-700">{Math.round(progress)}%</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Scanning</span>
      </div>
    </div>
    <h2 className="text-xl font-semibold text-slate-800 mb-2">{status}</h2>
    <p className="text-slate-500 text-sm h-6 overflow-hidden truncate max-w-sm animate-pulse">
      {currentFile || "Initializing..."}
    </p>
  </div>
);

/**
 * COMPONENT: Results Dashboard
 */
const ResultsDashboard = ({ files, onReset, onDeleteFiles }) => {
  const groups = useMemo(() => {
    const g = {};
    files.forEach(f => {
      const key = f.hash || f.id;
      if (!g[key]) g[key] = [];
      g[key].push(f);
    });
    return Object.values(g).filter(group => group.length > 1);
  }, [files]);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteStatus, setDeleteStatus] = useState('idle');

  const totalWastedSpace = groups.reduce((acc, group) => {
    return acc + (group[0].size * (group.length - 1));
  }, 0);

  const selectedCount = selectedIds.size;
  const selectedSize = files.filter(f => selectedIds.has(f.id)).reduce((acc, f) => acc + (parseInt(f.size) || 0), 0);

  const autoSelect = (strategy) => {
    const newSelected = new Set();
    groups.forEach(group => {
      const sorted = [...group].sort((a, b) => {
        const dateA = new Date(a.createdTime);
        const dateB = new Date(b.createdTime);
        return dateA - dateB;
      });

      if (strategy === 'newest') {
        sorted.slice(0, sorted.length - 1).forEach(f => newSelected.add(f.id));
      } else if (strategy === 'oldest') {
        sorted.slice(1).forEach(f => newSelected.add(f.id));
      }
    });
    setSelectedIds(newSelected);
  };

  const toggleFile = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const executeDelete = async () => {
    setDeleteStatus('deleting');
    await onDeleteFiles(Array.from(selectedIds));
    setDeleteStatus('deleted');
  };

  if (deleteStatus === 'deleted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cleanup Successful!</h2>
        <p className="text-slate-500 mb-8">
          Files have been moved to your Google Drive Trash.
        </p>
        <button
          onClick={onReset}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Scan Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Potential Savings</span>
          <span className="text-3xl font-bold text-indigo-600">{formatBytes(totalWastedSpace)}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Duplicate Sets</span>
          <span className="text-3xl font-bold text-slate-800">{groups.length}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Files Scanned</span>
          <span className="text-3xl font-bold text-slate-800">{files.length}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Smart Select:</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => autoSelect('oldest')} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:text-indigo-600">Keep Oldest</button>
          <button onClick={() => autoSelect('newest')} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:text-indigo-600">Keep Newest</button>
          <button onClick={() => setSelectedIds(new Set())} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium">Deselect All</button>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <File className="w-4 h-4 text-blue-500" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-slate-700 text-sm md:text-base truncate max-w-[200px] md:max-w-md">{group[0].name}</h3>
                  <span className="text-xs text-slate-400">{group.length} duplicates • {formatBytes(group[0].size)} each</span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded hidden md:block">
                MD5: {(group[0].hash || '').substring(0, 8)}...
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {group.map(file => (
                <div key={file.id} className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 ${selectedIds.has(file.id) ? 'bg-red-50/50' : ''}`} onClick={() => toggleFile(file.id)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(file.id) ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'}`}>
                      {selectedIds.has(file.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm ${selectedIds.has(file.id) ? 'text-red-700 decoration-red-300 line-through' : 'text-slate-600'}`}>{file.name}</span>
                      <span className="text-xs text-slate-400">{formatDate(file.createdTime)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 font-medium">{formatBytes(file.size)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium">No duplicates found!</h3>
            <p>Your drive is clean.</p>
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10">
          <div className="flex flex-col">
            <span className="font-bold">{selectedCount} files selected</span>
            <span className="text-xs text-slate-400">Total size: {formatBytes(selectedSize)}</span>
          </div>
          <button
            onClick={executeDelete}
            disabled={deleteStatus === 'deleting'}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
          >
            {deleteStatus === 'deleting' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Moving to Trash...</> : <><Trash2 className="w-4 h-4" /> Move to Trash</>}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * COMPONENT: Main App Container
 */
export default function App() {
  const [view, setView] = useState('intro');
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('Initializing...');
  const [currentFile, setCurrentFile] = useState('');

  // Auth & Settings State
  const [clientId, setClientId] = useState(() => localStorage.getItem('drive_purge_client_id') || '');
  const [manualToken, setManualToken] = useState(() => localStorage.getItem('drive_purge_manual_token') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const { gapiLoaded, gisLoaded } = useGoogleScripts();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Persistence
  const handleSetClientId = (newId) => {
    setClientId(newId);
    localStorage.setItem('drive_purge_client_id', newId);
  };

  const handleSetManualToken = (newToken) => {
    setManualToken(newToken);
    localStorage.setItem('drive_purge_manual_token', newToken);
    // Auto-login logic if token is added
    if (newToken && newToken.startsWith('ya29')) {
      setAccessToken(newToken);
      fetchUserInfo(newToken);
    } else if (!newToken) {
      setAccessToken(null);
      setUserInfo(null);
    }
  };

  const fetchUserInfo = (token) => {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Token invalid or expired');
        return res.json();
      })
      .then(data => setUserInfo(data))
      .catch(err => {
        console.error("Manual Token Info Error:", err);
        setUserInfo({ name: 'Manual User', picture: null }); // Fallback if userinfo scope missing
      });
  }

  // Initialize Google Auth (Standard Flow)
  useEffect(() => {
    if (gapiLoaded && gisLoaded && clientId) {
      const initializeGapiClient = async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
        } catch (error) {
          console.error("GAPI Init Error:", error);
        }
      };
      initializeGapiClient();

      try {
        const tClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (resp) => {
            if (resp.error !== undefined) {
              console.error(resp);
              alert("Auth Error: " + JSON.stringify(resp));
              return;
            }
            setAccessToken(resp.access_token);
            fetchUserInfo(resp.access_token);
          },
        });
        setTokenClient(tClient);
      } catch (error) {
        console.error("Token Client Init Error:", error);
      }
    }
  }, [gapiLoaded, gisLoaded, clientId]);

  // Handle Token Check on Load
  useEffect(() => {
    if (manualToken && manualToken.startsWith('ya29')) {
      setAccessToken(manualToken);
      fetchUserInfo(manualToken);
      // Ensure gapi client is loaded for calls later even if manual
      if (gapiLoaded && !window.gapi.client.drive) {
        window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        }).catch(e => console.warn("Manual gapi init warning:", e));
      }
    }
  }, [manualToken, gapiLoaded]);

  const handleLogin = () => {
    // Priority to manual token if present
    if (manualToken) {
      setAccessToken(manualToken);
      fetchUserInfo(manualToken);
      return;
    }

    if (!clientId) {
      setIsSettingsOpen(true);
      return;
    }
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      alert("Google API not fully loaded. If using in preview, please use the Manual Token option in settings.");
    }
  };

  const handleLogout = () => {
    if (manualToken) {
      setManualToken('');
      setAccessToken(null);
      setUserInfo(null);
      setView('intro');
      return;
    }
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
    setAccessToken(null);
    setUserInfo(null);
    setView('intro');
  };

  // --- REAL SCANNING LOGIC ---
  const scanRealDrive = async () => {
    setView('scanning');
    setIsDemoMode(false);
    setProgress(0);
    setScanStatus('Connecting to Drive API...');

    try {
      // Ensure the token is set on the gapi client for manual scenarios
      if (manualToken && window.gapi.client) {
        window.gapi.client.setToken({ access_token: manualToken });
      }

      let allFiles = [];
      let pageToken = null;
      let pageCount = 0;

      do {
        if (pageCount > 5) break;

        setScanStatus(`Fetching page ${pageCount + 1}...`);

        // For manual token without gapi fully loaded, we might need raw fetch fallback
        // But assuming gapi loaded:
        const response = await window.gapi.client.drive.files.list({
          'pageSize': 100,
          'fields': 'nextPageToken, files(id, name, mimeType, size, createdTime, md5Checksum, thumbnailLink, trashed)',
          'q': "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
          'pageToken': pageToken
        });

        const newFiles = response.result.files;
        if (newFiles && newFiles.length > 0) {
          allFiles = [...allFiles, ...newFiles];
          setCurrentFile(newFiles[newFiles.length - 1].name);
        }

        pageToken = response.result.nextPageToken;
        pageCount++;
        setProgress(Math.min(90, pageCount * 15));

      } while (pageToken);

      setScanStatus('Analyzing duplicates...');
      setProgress(95);

      const validFiles = allFiles.map(f => ({
        ...f,
        hash: f.md5Checksum || f.id
      }));

      setFiles(validFiles);

      setTimeout(() => {
        setView('results');
      }, 500);

    } catch (err) {
      console.error(err);
      // Fallback for Manual Token if GAPI fails (rare but possible in strict sandbox)
      if (manualToken) {
        alert("GAPI Client Error with Manual Token. Please check console. Token might be expired.");
      } else {
        alert("Error scanning Drive: " + err.message);
      }
      setView('intro');
    }
  };

  // --- DEMO SCANNING LOGIC ---
  const scanDemoDrive = () => {
    setView('scanning');
    setIsDemoMode(true);
    setProgress(0);
    setScanStatus('Initializing Demo...');

    setTimeout(() => {
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        if (p >= 100) {
          clearInterval(interval);
          setFiles(generateMockData());
          setView('results');
        }
        setProgress(p);
        if (p > 20) {
          setScanStatus('Analysing mock files...');
          setCurrentFile(`Checking IMG_${Math.floor(Math.random() * 9000)}.jpg`);
        }
      }, 100);
    }, 500);
  };

  const handleStart = () => {
    if (accessToken) {
      scanRealDrive();
    } else {
      scanDemoDrive();
    }
  };

  const handleDeleteFiles = async (idsToDelete) => {
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 1500));
      return;
    }

    try {
      if (manualToken && window.gapi.client) {
        window.gapi.client.setToken({ access_token: manualToken });
      }
      const batchSize = 5;
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        await Promise.all(batch.map(id =>
          window.gapi.client.drive.files.update({
            fileId: id,
            trashed: true
          })
        ));
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete some files. Check console.");
    }
  };

  const handleReset = () => {
    setView('intro');
    setFiles([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Drive<span className="text-indigo-600">Purge</span></span>
            </div>

            <div className="flex items-center gap-4">
              {isDemoMode && view === 'results' && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
                  <Shield className="w-3 h-3" />
                  DEMO MODE
                </div>
              )}
              {userInfo ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-700">{userInfo.name || 'User'}</div>
                    <div onClick={handleLogout} className="text-xs text-red-500 cursor-pointer hover:underline">Sign Out</div>
                  </div>
                  {userInfo.picture ? (
                    <img src={userInfo.picture} className="w-8 h-8 rounded-full border border-slate-200" alt="Avatar" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {(userInfo.name || 'U')[0]}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'intro' && (
          <IntroScreen
            onStartDemo={handleStart}
            onLogin={handleLogin}
            isRealReady={gapiLoaded && gisLoaded && clientId}
            user={userInfo}
            clientId={clientId}
            manualToken={manualToken}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
        {view === 'scanning' && <ScanningScreen progress={progress} currentFile={currentFile} status={scanStatus} />}
        {view === 'results' && <ResultsDashboard files={files} onReset={handleReset} onDeleteFiles={handleDeleteFiles} />}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clientId={clientId}
        setClientId={handleSetClientId}
        manualToken={manualToken}
        setManualToken={handleSetManualToken}
      />

      <footer className="border-t border-slate-200 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; 2024 DrivePurge. <span className="opacity-50">Not affiliated with Google. Use at your own risk.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
