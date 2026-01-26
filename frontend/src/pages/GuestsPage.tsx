import { useEffect, useState } from 'react';
import { guestsApi, groupsApi, importApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type {
  Guest,
  Group,
  GuestStats as GuestStatsType,
  CreateGuestDto,
  UpdateGuestDto,
  ImportPreviewResponse,
  RsvpStatus,
} from '../types';
import GuestStats from '../components/guests/GuestStats';
import GuestList from '../components/guests/GuestList';
import GuestForm from '../components/guests/GuestForm';
import ManageGroupsModal from '../components/guests/ManageGroupsModal';
import InvitationImageUpload from '../components/settings/InvitationImageUpload';
import Modal from '../components/common/Modal'; // Using legacy modal wrapper for now
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';

function GuestsPage() {
  const { wedding, setWedding } = useAuth();
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
    total_gifts: 0, // Added to match type
  });
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManageGroupsModal, setShowManageGroupsModal] = useState(false);
  const [showInvitationImageModal, setShowInvitationImageModal] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<number[]>([]);
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
      toast.error('שגיאה בטעינת נתונים');
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
      toast.success('מוזמן נוסף בהצלחה');
    } catch (error) {
      toast.error('שגיאה בהוספת מוזמן');
    }
  };

  const handleConfirmEdit = async (data: UpdateGuestDto) => {
    if (!guestToEdit) return;
    try {
      await guestsApi.update(guestToEdit.id, data);
      setShowEditModal(false);
      setGuestToEdit(null);
      await loadData();
      toast.success('פרטי מוזמן עודכנו');
    } catch (error) {
      toast.error('שגיאה בעדכון פרטים');
    }
  };

  const handleConfirmDelete = async () => {
    if (!guestToDelete) return;
    try {
      await guestsApi.delete(guestToDelete.id);
      setShowDeleteModal(false);
      setGuestToDelete(null);
      await loadData();
      toast.success('מוזמן נמחק');
    } catch (error) {
      toast.error('שגיאה במחיקת מוזמן');
    }
  };

  const handleCreateGroup = async (name: string): Promise<Group> => {
    try {
      const response = await groupsApi.create({ name });
      const newGroup = response.data;
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

  // Bulk operation handlers
  const handleBulkDelete = (ids: number[]) => {
    setBulkDeleteIds(ids);
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;
    try {
      const response = await guestsApi.bulkDelete({ ids: bulkDeleteIds });
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
      await loadData();
      toast.success(response.data.message || `${bulkDeleteIds.length} מוזמנים נמחקו בהצלחה`);
    } catch (error) {
      toast.error('שגיאה במחיקת מוזמנים');
    }
  };

  const handleBulkUpdateRsvp = async (ids: number[], rsvpStatus: RsvpStatus) => {
    try {
      const response = await guestsApi.bulkUpdateRsvp({ ids, rsvp_status: rsvpStatus });
      await loadData();
      toast.success(response.data.message || `סטטוס עודכן עבור ${ids.length} מוזמנים`);
    } catch (error) {
      toast.error('שגיאה בעדכון סטטוס');
    }
  };

  const handleBulkUpdateGroup = async (ids: number[], groupId: number) => {
    try {
      const response = await guestsApi.bulkUpdateGroup({ ids, group_id: groupId });
      await loadData();
      toast.success(response.data.message || `${ids.length} מוזמנים הועברו לקבוצה`);
    } catch (error) {
      toast.error('שגיאה בהעברת מוזמנים לקבוצה');
    }
  };

  return loading ? (
    <div className="p-8">טוען מוזמנים...</div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ניהול מוזמנים</h1>
      </div>

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
        onManageInvitationImage={() => setShowInvitationImageModal(true)}
        onGuestUpdate={(updatedGuest) => {
          setGuests(guests.map(g => g.id === updatedGuest.id ? updatedGuest : g));
        }}
        onBulkUpdate={(updatedGuests) => {
          const updatedMap = new Map(updatedGuests.map(g => [g.id, g]));
          setGuests(guests.map(g => updatedMap.get(g.id) || g));
        }}
        onBulkDelete={handleBulkDelete}
        onBulkUpdateRsvp={handleBulkUpdateRsvp}
        onBulkUpdateGroup={handleBulkUpdateGroup}
      />

      {/* Add Guest Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="הוספת מוזמן חדש">
        <GuestForm
          onSubmit={handleConfirmAdd}
          groups={groups}
          onCancel={() => setShowAddModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      </Modal>

      {/* Edit Guest Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="עריכת מוזמן">
        <GuestForm
          initialValue={guestToEdit || undefined}
          groups={groups}
          onSubmit={(data) => { void handleConfirmEdit(data as any); }}
          onCancel={() => setShowEditModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="מחיקת מוזמן">
        <div className="text-center space-y-4">
          <p>
            האם אתה בטוח שברצונך למחוק את
            {guestToDelete ? <strong className="mx-1">{guestToDelete.name}</strong> : ' המוזמן '}?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              מחק
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal 
        isOpen={showBulkDeleteModal} 
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }} 
        title="מחיקת מוזמנים"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-lg">
            האם אתה בטוח שברצונך למחוק{' '}
            <strong className="text-destructive">{bulkDeleteIds.length}</strong>{' '}
            מוזמנים?
          </p>
          <p className="text-sm text-muted-foreground">
            פעולה זו לא ניתנת לביטול.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBulkDeleteModal(false);
                setBulkDeleteIds([]);
              }}
            >
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleConfirmBulkDelete}>
              מחק {bulkDeleteIds.length} מוזמנים
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => {
        setShowImportModal(false);
        setFileToImport(null);
        setImportPreview(null);
      }} title="ייבוא מוזמנים מאקסל">
        <div className="w-full max-w-4xl">
          {!importPreview ? (
            // Upload Stage
            <div className="space-y-6">
              {/* Format Instructions */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">📋 פורמט הקובץ הנדרש:</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• קובץ Excel בפורמט .xlsx או .xls</p>
                  <p>• השורה הראשונה חייבת להכיל את הכותרות הבאות:</p>
                  <div className="bg-muted rounded px-3 py-2 mt-2 font-mono text-xs">
                    שם קבוצה | שם | טלפון | מספר מוזמנים
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
        ${isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
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
                    <div className="flex justify-center">
                      <UploadCloud className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold mb-2">
                        לחץ לבחירת קובץ Excel
                      </p>
                      <p className="text-muted-foreground">
                        או גרור קובץ לכאן
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground mt-4">
                      קבצים נתמכים: .xlsx, .xls (מקסימום 5MB)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">✅</div>
                    <div>
                      <p className="text-xl font-semibold mb-1">
                        {fileToImport.name}
                      </p>
                      <p className="text-muted-foreground">
                        {(fileToImport.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToImport(null);
                      }}
                    >
                      הסר קובץ
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportModal(false);
                    setFileToImport(null);
                  }}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleUploadAndPreview}
                  disabled={!fileToImport || isUploading}
                >
                  {isUploading ? 'מעבד...' : 'המשך לתצוגה מקדימה'}
                </Button>
              </div>
            </div>
          ) : (
            // Preview Stage
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {importPreview.summary.valid}
                  </div>
                  <div className="text-xs mt-1">תקינים</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {importPreview.summary.duplicates}
                  </div>
                  <div className="text-xs mt-1">כפולים</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {importPreview.summary.errors}
                  </div>
                  <div className="text-xs mt-1">שגיאות</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {importPreview.summary.total}
                  </div>
                  <div className="text-xs mt-1">סה"כ</div>
                </div>
              </div>

              {/* Errors Display */}
              {importPreview.errors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h3 className="text-destructive font-semibold mb-3">⚠️ שגיאות שנמצאו:</h3>
                  <div className="space-y-2">
                    {importPreview.errors.map((error, idx) => (
                      <div key={idx} className="text-sm rounded p-2 bg-background/50">
                        <span className="font-mono font-bold">שורה {error.row}</span>
                        {' - '}
                        <span className="text-muted-foreground">{error.field}:</span>
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
                  <h3 className="text-yellow-600 dark:text-yellow-400 font-semibold mb-3">🔄 מוזמנים כפולים:</h3>
                  <div className="space-y-2 text-sm">
                    {importPreview.duplicates.map((dup, idx) => (
                      <div key={idx} className="rounded p-2 bg-background/50">
                        <span className="font-semibold">{dup.newGuest.name}</span>
                        {' '}
                        <span className="text-muted-foreground">({dup.newGuest.phoneNumber})</span>
                        {' - '}
                        <span className="text-yellow-600 dark:text-yellow-400">כבר קיים במערכת</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
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
                    onClick={handleConfirmImport}
                    disabled={isUploading}
                  >
                    {isUploading ? 'מייבא...' : `ייבא ${importPreview.summary.valid} מוזמנים`}
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

      {/* Invitation Image Modal */}
      <Modal
        isOpen={showInvitationImageModal}
        onClose={() => setShowInvitationImageModal(false)}
        title="הגדרות תמונת הזמנה"
      >
        <div className="w-full max-w-xl space-y-4">
          {wedding && (
            <InvitationImageUpload
              wedding={wedding}
              onUpdate={(updatedWedding) => {
                setWedding(updatedWedding);
              }}
            />
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowInvitationImageModal(false)}
            >
              סגור
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default GuestsPage;
