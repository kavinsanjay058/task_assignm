import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { OperationType } from '../types';
import { Plus, AlertCircle } from 'lucide-react';

export const TaskForm: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setFirestoreError(null);

    // Validation: Title is required and cannot be whitespace only
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Task title is required.');
      return;
    }

    if (!user) {
      setValidationError('You must be signed in to create a task.');
      return;
    }

    if (!db) {
      setFirestoreError('Firebase database is not configured. Please check environment variables.');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        userId: user.uid,
        title: trimmedTitle,
        description: description.trim(),
        status: 'Planned' as const, // New tasks automatically start with status "Planned"
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'tasks'), taskData);

      // Reset form state upon success
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error creating task:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'tasks');
      } catch (wrappedErr) {
        setFirestoreError(
          err instanceof Error ? err.message : 'An error occurred while saving the task to Firestore.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Create Task</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add a new task to your personal backlog (starts as <span className="font-medium text-slate-700">Planned</span>).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Validation Error Message */}
        {validationError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Firestore Error Message */}
        {firestoreError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{firestoreError}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Title Field (Required) */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g., Investigate webhook timeout issue"
              maxLength={150}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Description Field (Optional) */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description <span className="text-slate-400 font-normal normal-case">(Optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add relevant context, steps to reproduce, or verification notes..."
              maxLength={1000}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 self-start sm:self-center">
              New tasks automatically start with status <span className="font-semibold text-slate-700">Planned</span>.
            </div>

            <button
              id="create-task-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
