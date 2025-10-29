import { useEffect, useState } from 'react';
import { groupsApi } from '../services/api';
import type { Group } from '../types';
import Loading from '../components/common/Loading';
import Header from '../components/common/Header';
import GroupList from '../components/groups/GroupList';
import GroupForm from '../components/groups/GroupForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupsApi.getAll();
      setGroups(response.data);
    } catch (err) {
      console.error('Error loading groups:', err);
      toast.error('שגיאה בטעינת הקבוצות, אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (group: Group) => {
    setGroupToEdit(group);
    setShowEditModal(true);
  };

  const handleDelete = (groupId: number) => {
    const group = groups.find(g => g.id === groupId) || null;
    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  const handleConfirmAdd = async (name: string) => {
    try {
      await groupsApi.create({ name });
      setShowAddModal(false);
      await loadGroups();
    } catch (err) {
      console.error('Error creating group:', err);
      toast.error('שגיאה ביצירת הקבוצה, אנא נסה שנית.');
    }
  };

  const handleConfirmEdit = async (name: string) => {
    if (!groupToEdit) return;
    try {
      await groupsApi.update(groupToEdit.id, { name });
      setShowEditModal(false);
      setGroupToEdit(null);
      await loadGroups();
    } catch (err) {
      console.error('Error updating group:', err);
      toast.error('שגיאה בעדכון הקבוצה, אנא נסה שנית.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await groupsApi.delete(groupToDelete.id);
      setShowDeleteModal(false);
      setGroupToDelete(null);
      await loadGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
      toast.error('שגיאה במחיקת הקבוצה, אנא נסה שנית.');
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Header title="קבוצות מוזמנים" />
        
        {/* Group List */}
        <GroupList 
          groups={groups}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />

        {/* Add Group Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">הוספת קבוצה חדשה</h2>
            <GroupForm 
              onSubmit={handleConfirmAdd} 
              onCancel={() => setShowAddModal(false)} 
            />
          </div>
        </Modal>

        {/* Edit Group Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">עריכת קבוצה</h2>
            <GroupForm 
              initialValue={groupToEdit?.name || ''} 
              onSubmit={handleConfirmEdit} 
              onCancel={() => setShowEditModal(false)} 
            />
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="text-6xl mb-4">🗑️</div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4">מחיקת קבוצה</h2>
            <p className="text-gray-300 mb-8">
              האם אתה בטוח שברצונך למחוק את הקבוצה
              {groupToDelete ? ` "${groupToDelete.name}" ` : ' '}?
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

export default GroupsPage;