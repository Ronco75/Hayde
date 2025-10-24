import { useEffect, useState } from 'react';
import { guestsApi, groupsApi } from '../services/api';
import type { Guest, Group, GuestStats as GuestStatsType, CreateGuestDto, UpdateGuestDto } from '../types';
import Loading from '../components/common/Loading';
import Header from '../components/common/Header';
import GuestStats from '../components/guests/GuestStats';
import GuestList from '../components/guests/GuestList';
import GuestForm from '../components/guests/GuestForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

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

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Header title="מוזמנים" backTo="/" />
        
        {/* Guest Stats */}
        <GuestStats stats={stats} />

        {/* Guest List */}
        <GuestList 
          guests={guests}
          groups={groups}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
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
      </div>
    </div>
  );
}

export default GuestsPage;
