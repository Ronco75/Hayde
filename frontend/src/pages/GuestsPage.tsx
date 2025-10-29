import { useEffect, useState } from 'react';
import { guestsApi, groupsApi, importApi } from '../services/api';
import type { Guest,
  Group,
  GuestStats as GuestStatsType,
  CreateGuestDto,
  UpdateGuestDto,
  ImportPreviewResponse,
} from '../types';
import Loading from '../components/common/Loading';
import Header from '../components/common/Header';
import GuestStats from '../components/guests/GuestStats';
import GuestList from '../components/guests/GuestList';
import GuestForm from '../components/guests/GuestForm';
import ManageGroupsModal from '../components/guests/ManageGroupsModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<GuestStatsType>({
    total_guests: 0,
    total_attendees: 0,
    confirmed_guests: 0,
    confirmed_attendees: 0,
    declined_guests: 0,
    pending_guests: 0,
    invitations_sent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManageGroupsModal, setShowManageGroupsModal] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreviewResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [guestsResponse, groupsResponse, statsResponse] = await Promise.all([
        guestsApi.getAll(),
        groupsApi.getAll(),
        guestsApi.getStats(),
      ]);
      setGuests(guestsResponse.data);
      setGroups(groupsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (guest: Guest) => {
    setGuestToEdit(guest);
    setShowEditModal(true);
  };

  const handleDelete = (guestId: number) => {
    const guest = guests.find(g => g.id === guestId) || null;
    setGuestToDelete(guest);
    setShowDeleteModal(true);
  };

  const handleConfirmAdd = async (data: CreateGuestDto) => {
    try {
      await guestsApi.create(data);
      setShowAddModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating guest:', error);
    }
  };

  const handleConfirmEdit = async (data: UpdateGuestDto) => {
    if (!guestToEdit) return;
    try {
      await guestsApi.update(guestToEdit.id, data);
      setShowEditModal(false);
      setGuestToEdit(null);
      await loadData();
    } catch (error) {
      console.error('Error updating guest:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!guestToDelete) return;
    try {
      await guestsApi.delete(guestToDelete.id);
      setShowDeleteModal(false);
      setGuestToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting guest:', error);
    }
  };

  const handleCreateGroup = async (name: string): Promise<Group> => {
    try {
      const response = await groupsApi.create({ name });
      const newGroup = response.data;
      // Update the groups list immediately
      setGroups(prevGroups => [...prevGroups, newGroup]);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleManageGroups = () => {
    setShowManageGroupsModal(true);
  };

  const handleUploadAndPreview = async () => {
    if (!fileToImport) return;

    setIsUploading(true);

    try {
      const response = await importApi.preview(fileToImport);
      setImportPreview(response.data);
    } catch (err) {
      console.error('Error uploading and previewing file:', err);
      toast.error('שגיאה בעיבוד הקובץ, אנא נסה שנית.');
    } finally {
        setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
  
    setIsUploading(true);
    
    try {
      await importApi.confirm({
        guests: importPreview.valid.map(g => ({
          groupName: g.groupName,
          name: g.name,
          phoneNumber: g.phoneNumber,
          numberOfGuests: g.numberOfGuests,
        })),
        replaceExisting: false,
      });
  
      toast.success('המוזמנים יובאו בהצלחה!');
  
      setShowImportModal(false);
      setFileToImport(null);
      setImportPreview(null);
      await loadData();
      
    } catch (err) {
      console.error('Error confirming import:', err);
      toast.error('שגיאה בייבוא המוזמנים. אנא נסה שנית.');
    } finally {
      setIsUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setFileToImport(file);
      } else {
        toast.error('קובץ שגוי, יש להעלות קובץ Excel');
      }
    }
  };
    
  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Header title="מוזמנים" />
        
        {/* Guest Stats */}
        <GuestStats stats={stats} />

        {/* Guest List */}
        <GuestList
          guests={guests}
          groups={groups}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onImport={handleImport}
          onManageGroups={handleManageGroups}
        />

        {/* Add Guest Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">הוספת מוזמן חדש</h2>
            <GuestForm
              onSubmit={handleConfirmAdd}
              groups={groups}
              onCancel={() => setShowAddModal(false)}
              onCreateGroup={handleCreateGroup}
            />
          </div>
        </Modal>

        {/* Edit Guest Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">עריכת מוזמן</h2>
            <GuestForm
              initialValue={guestToEdit || undefined}
              groups={groups}
              onSubmit={(data) => { void handleConfirmEdit(data as any); }}
              onCancel={() => setShowEditModal(false)}
              onCreateGroup={handleCreateGroup}
            />
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="text-6xl mb-4">🗑️</div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4">מחיקת מוזמן</h2>
            <p className="text-gray-300 mb-8">
              האם אתה בטוח שברצונך למחוק את
              {guestToDelete ? ` "${guestToDelete.name}" ` : ' '}?
              <br />
              <span className="font-semibold text-red-400">לא ניתן לשחזר את הפעולה הזו.</span>
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" type="button" onClick={() => setShowDeleteModal(false)}>
                ביטול
              </Button>
              <Button variant="danger" type="button" onClick={handleConfirmDelete}>
                מחק
              </Button>
            </div>
          </div>
        </Modal>

{/* Import Modal */}
<Modal isOpen={showImportModal} onClose={() => {
  setShowImportModal(false);
  setFileToImport(null);
  setImportPreview(null);
}}>
  <div className="w-full max-w-4xl">
    <h2 className="text-2xl font-bold text-gray-100 mb-6">
      ייבוא מוזמנים מאקסל
    </h2>
    
    {!importPreview ? (
      // Upload Stage
      <div className="space-y-6">
        {/* Format Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-300 font-semibold mb-2">📋 פורמט הקובץ הנדרש:</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <p>• קובץ Excel בפורמט .xlsx או .xls</p>
            <p>• השורה הראשונה חייבת להכיל את הכותרות הבאות:</p>
            <div className="bg-slate-800 rounded px-3 py-2 mt-2 font-mono text-xs">
              שם קבוצה | שם | טלפון | מספר מוזמנים
            </div>
          </div>
        </div>

{/* File Upload Area */}
<div 
  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
    ${isDragging 
      ? 'border-primary-400 bg-primary-500/20 scale-105' 
      : 'border-gray-600 hover:border-primary-500 hover:bg-slate-800/30'
    }`}
  onClick={() => document.getElementById('excel-upload')?.click()}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  <input
    type="file"
    id="excel-upload"
    accept=".xlsx,.xls"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileToImport(file);
      }
    }}
  />
  
  {!fileToImport ? (
    <div className="space-y-4">
      <div className="text-7xl">📊</div>
      <div>
        <p className="text-xl text-gray-200 font-semibold mb-2">
          לחץ לבחירת קובץ Excel
        </p>
        <p className="text-gray-400">
          או גרור קובץ לכאן
        </p>
      </div>
      <div className="text-sm text-gray-500 mt-4">
        קבצים נתמכים: .xlsx, .xls (מקסימום 5MB)
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="text-6xl">✅</div>
      <div>
        <p className="text-xl text-gray-200 font-semibold mb-1">
          {fileToImport.name}
        </p>
        <p className="text-gray-400">
          {(fileToImport.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setFileToImport(null);
        }}
        className="text-red-400 hover:text-red-300 text-sm font-semibold 
                   px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        ✕ הסר קובץ
      </button>
    </div>
  )}
</div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              setShowImportModal(false);
              setFileToImport(null);
            }}
          >
            ביטול
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleUploadAndPreview}
            disabled={!fileToImport}
          >
            {isUploading ? '⏳ מעבד קובץ...' : 'המשך לתצוגה מקדימה'}
          </Button>
        </div>
      </div>
    ) : (
      // Preview Stage
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-300">
              {importPreview.summary.valid}
            </div>
            <div className="text-gray-400 text-sm mt-1">תקינים</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-300">
              {importPreview.summary.duplicates}
            </div>
            <div className="text-gray-400 text-sm mt-1">כפולים</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-300">
              {importPreview.summary.errors}
            </div>
            <div className="text-gray-400 text-sm mt-1">שגיאות</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-300">
              {importPreview.summary.total}
            </div>
            <div className="text-gray-400 text-sm mt-1">סה"כ</div>
          </div>
        </div>

        {/* Errors Display */}
        {importPreview.errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
            <h3 className="text-red-300 font-semibold mb-3">⚠️ שגיאות שנמצאו:</h3>
            <div className="space-y-2">
              {importPreview.errors.map((error, idx) => (
                <div key={idx} className="text-sm text-gray-300 bg-slate-800 rounded p-2">
                  <span className="font-mono text-red-400">שורה {error.row}</span>
                  {' - '}
                  <span className="text-gray-400">{error.field}:</span>
                  {' '}
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicates Display */}
        {importPreview.duplicates.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
            <h3 className="text-yellow-300 font-semibold mb-3">🔄 מוזמנים כפולים:</h3>
            <div className="space-y-2 text-sm text-gray-300">
              {importPreview.duplicates.map((dup, idx) => (
                <div key={idx} className="bg-slate-800 rounded p-2">
                  <span className="font-semibold">{dup.newGuest.name}</span>
                  {' '}
                  <span className="text-gray-500">({dup.newGuest.phoneNumber})</span>
                  {' - '}
                  <span className="text-yellow-400">כבר קיים במערכת</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowImportModal(false);
              setFileToImport(null);
              setImportPreview(null);
            }}
          >
            ביטול
          </Button>
          {importPreview.summary.valid > 0 && (
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmImport}
              disabled={isUploading}
            >
              {isUploading ? '⏳ מייבא...' : `ייבא ${importPreview.summary.valid} מוזמנים`}
            </Button>
          )}
        </div>
      </div>
    )}
  </div>
</Modal>

        {/* Manage Groups Modal */}
        <ManageGroupsModal
          isOpen={showManageGroupsModal}
          onClose={() => setShowManageGroupsModal(false)}
          groups={groups}
          guests={guests}
          onGroupsChange={loadData}
        />

      </div>
    </div>
  );
}

export default GuestsPage;
