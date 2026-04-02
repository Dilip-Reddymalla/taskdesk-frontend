import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PriorityBadge from '../ui/PriorityBadge';
import { formatDate } from '../../utils/date';

function TaskDetailsModal({ isOpen, onClose, task, onEdit, onComplete, onDelete, onUploaded }) {
  const { uploadImages } = useTasks();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [localImages, setLocalImages] = useState([]);

  // Sync images when modal opens
  useEffect(() => {
    if (isOpen && task && task.images) {
      setLocalImages(task.images);
    } else {
      setLocalImages([]);
    }
  }, [isOpen, task]);

  // Protect against null tasks entirely
  if (!isOpen || !task) {
    return null;
  }

  // Ultra-safe data retrieval (prefer instance override, fallback to parent task)
  const title = task?.title || task?.task?.title || 'Untitled Task';
  const description = task?.description || task?.task?.description || '';
  const priority = task?.priority || task?.task?.priority || 'low';
  const planTitle = task?.plan?.title || '';
  const dateStr = task?.date ? formatDate(task.date) : '';
  const isCompleted = task?.status === 'completed' || task?.isCompleted === true;

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Reset so the same file could theoretically be chosen again
    e.target.value = '';

    const formData = new FormData();
    formData.append('taskInstanceId', task._id);
    files.forEach(f => formData.append('images', f));

    setUploading(true);
    try {
      const addedImages = await uploadImages(formData);
      if (addedImages && addedImages.length > 0) {
        setLocalImages(prev => [...prev, ...addedImages]);
        if (typeof onUploaded === 'function') {
          onUploaded(addedImages, task);
        }
        addToast('Attachments uploaded successfully!', 'success');
      }
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to upload attachments', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleMarkComplete = () => {
    onClose();
    if (typeof onComplete === 'function') onComplete(task);
  };

  const handleEdit = () => {
    onClose();
    if (typeof onEdit === 'function') onEdit(task);
  };

  const handleDelete = () => {
    onClose();
    if (typeof onDelete === 'function') onDelete(task);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task" size="md">
      <div style={{ padding: '0 8px' }}>
        
        {/* Header Segment */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h2>
          <PriorityBadge priority={priority} />
        </div>

        {/* Metadata Segment */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          {dateStr && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '6px' }}>
              <span style={{ marginRight: '8px' }}>📅</span> Date: <strong style={{ color: 'var(--text-primary)' }}>{dateStr}</strong>
            </div>
          )}
          {planTitle && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ marginRight: '8px' }}>📋</span> Plan: <strong style={{ color: 'var(--text-primary)' }}>{planTitle}</strong>
            </div>
          )}
        </div>

        {/* Description Segment */}
        {description && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Description
            </h3>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Attachments Segment */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.5px' }}>
              Attachments
            </h3>
            {!isCompleted && (
              <Button size="sm" variant="ghost" onClick={handleUploadClick} disabled={uploading}>
                {uploading ? '⌛ Uploading...' : '📎 Add Files'}
              </Button>
            )}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>

          {localImages.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {localImages.map((imgUrl, idx) => (
                <a 
                  key={idx} 
                  href={imgUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1/1' }}
                >
                  <img src={imgUrl} alt={`Attachment ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </a>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No images attached to this task.
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isCompleted && (
            <Button variant="primary" size="lg" onClick={handleMarkComplete}>
              ✓ Mark Task as Completed
            </Button>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            {!isCompleted && (
              <Button variant="outline" style={{ flex: 1 }} onClick={handleEdit}>
                ✎ Edit Task
              </Button>
            )}
            <Button variant="danger" style={{ flex: 1 }} onClick={handleDelete}>
              🗑 Delete Task
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}

export default TaskDetailsModal;
