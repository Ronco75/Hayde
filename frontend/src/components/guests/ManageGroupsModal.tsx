import { useState } from 'react';
import { groupsApi } from '../../services/api';
import type { Group, Guest } from '../../types';
import Modal from '../common/Modal';
import GroupList from './GroupList';
import GroupForm from './GroupForm';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface ManageGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  guests: Guest[];
  onGroupsChange: () => void;
}

function ManageGroupsModal({ isOpen, onClose, groups, guests, onGroupsChange }: ManageGroupsModalProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

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
      onGroupsChange();
      toast.success('קבוצה נוספה בהצלחה');
    } catch (err) {
      console.error('Error creating group:', err);
      // Error toast handled by axios interceptor
    }
  };

  const handleConfirmEdit = async (name: string) => {
    if (!groupToEdit) return;
    try {
      await groupsApi.update(groupToEdit.id, { name });
      setShowEditModal(false);
      setGroupToEdit(null);
      onGroupsChange();
      toast.success('קבוצה עודכנה בהצלחה');
    } catch (err) {
      console.error('Error updating group:', err);
      // Error toast handled by axios interceptor
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await groupsApi.delete(groupToDelete.id);
      setShowDeleteModal(false);
      setGroupToDelete(null);
      onGroupsChange();
      toast.success('קבוצה נמחקה בהצלחה');
    } catch (err) {
      console.error('Error deleting group:', err);
      // Error toast handled by axios interceptor
    }
  };

  return (
    <>
      {/* Main Manage Groups Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">ניהול קבוצות</h2>
          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <GroupList
              groups={groups}
              guests={guests}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          </div>
        </div>
      </Modal>

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
    </>
  );
}

export default ManageGroupsModal;
