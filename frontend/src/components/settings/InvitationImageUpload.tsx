import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Image as ImageIcon, Check, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { weddingApi } from '../../services/api';
import type { Wedding } from '../../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InvitationImageUploadProps {
  wedding: Wedding;
  onUpdate: (updatedWedding: Wedding) => void;
}

export default function InvitationImageUpload({
  wedding,
  onUpdate,
}: InvitationImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImage = !!wedding.invitation_image_url;
  const imageUrl = wedding.invitation_image_url
    ? `http://localhost:3000${wedding.invitation_image_url}`
    : null;

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('סוג קובץ לא נתמך. נא להעלות JPG, PNG, GIF או WEBP');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('הקובץ גדול מדי. גודל מקסימלי: 10MB');
      return;
    }

    setUploading(true);
    setImageLoaded(false);
    try {
      const response = await weddingApi.uploadInvitationImage(file);
      toast.success('תמונת ההזמנה הועלתה בהצלחה');
      onUpdate(response.data.wedding);
    } catch {
      // Error handled by API interceptor
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDelete = async () => {
    if (!confirm('האם למחוק את תמונת ההזמנה?')) return;

    setDeleting(true);
    try {
      const response = await weddingApi.deleteInvitationImage();
      toast.success('תמונת ההזמנה נמחקה');
      onUpdate(response.data.wedding);
    } catch {
      // Error handled by API interceptor
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <ImageIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">תמונת הזמנה</h3>
          <p className="text-sm text-muted-foreground">
            תמונה זו תישלח עם ההזמנות בוואטסאפ
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {hasImage && imageUrl ? (
          /* Image Preview */
          <motion.div
            key="preview"
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Image Container */}
            <div className="relative rounded-xl overflow-hidden border bg-muted/50 group">
              <motion.img
                src={imageUrl}
                alt="תמונת הזמנה"
                className="w-full h-64 object-contain"
                onLoad={() => setImageLoaded(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Status badge */}
              <div
                className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/90 text-white shadow-sm"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                <span>תמונה פעילה</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleUploadClick}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    מעלה...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    החלף תמונה
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    מחק
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Drop Zone for Upload */
          <motion.div
            key="dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={!uploading ? handleUploadClick : undefined}
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
              ${uploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:bg-muted/50'}
              ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            `}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${dragOver ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-lg">
                  {dragOver ? 'שחרר את הקובץ כאן' : 'גרור תמונה לכאן'}
                </p>
                <p className="text-sm text-muted-foreground">או לחץ לבחירה</p>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                JPG, PNG, GIF • עד 10MB
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-500 mt-0.5" />
          <p className="text-sm">
            <strong>טיפ:</strong> מומלץ להעלות תמונה באיכות גבוהה עם פרטי האירוע.
            התמונה תצורף אוטומטית להזמנות שנשלחות בוואטסאפ.
          </p>
        </div>
      </div>
    </Card>
  );
}
