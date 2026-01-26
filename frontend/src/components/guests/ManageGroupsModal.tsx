import { useState } from 'react';
import { groupsApi } from '../../services/api';
import type { Group, Guest } from '../../types';
import Modal from '../common/Modal';
import GroupList from './GroupList';
import GroupForm from './GroupForm';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

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
    }
  };

  return (
    <>
      {/* Main Manage Groups Modal */}
      <Modal isOpen={isOpen} onClose={onClose} title="ניהול קבוצות">
        {/* We might want to make the modal wider for this view if possible, but default width is okay */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <GroupList
            groups={groups}
            guests={guests}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>
      </Modal>

      {/* Add Group Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="הוספת קבוצה חדשה">
        <GroupForm
          onSubmit={handleConfirmAdd}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Group Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="עריכת קבוצה">
        <GroupForm
          initialValue={groupToEdit?.name || ''}
          onSubmit={handleConfirmEdit}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="מחיקת קבוצה">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            האם אתה בטוח שברצונך למחוק את הקבוצה
            {groupToDelete ? <span className="font-bold text-foreground mx-1">{groupToDelete.name}</span> : ' '}?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              מחק
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ManageGroupsModal;
