import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, OperationType } from '../types';
import {
  CheckCircle2,
  Clock,
  CircleDot,
  AlertCircle,
  Inbox,
  Filter,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  Planned: {
    label: 'Planned',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
  },
  'In Progress': {
    label: 'In Progress',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <CircleDot className="w-3.5 h-3.5 text-amber-600" />,
  },
  Complete: {
    label: 'Complete',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
};

const STATUS_OPTIONS: TaskStatus[] = ['Planned', 'In Progress', 'Complete'];

export const TaskList: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query specifically scoped to the authenticated user's Firebase UID
    const tasksCollection = collection(db, 'tasks');
    const userTasksQuery = query(tasksCollection, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      userTasksQuery,
      (snapshot) => {
        const loadedTasks: Task[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            title: data.title,
            description: data.description || '',
            status: (data.status as TaskStatus) || 'Planned',
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
          };
        });

        // Client-side sort by createdAt descending (newest first)
        loadedTasks.sort((a, b) => {
          const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setTasks(loadedTasks);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Error fetching user tasks:', snapshotError);
        setError('Failed to fetch tasks from Firestore.');
        setLoading(false);
        try {
          handleFirestoreError(snapshotError, OperationType.LIST, 'tasks');
        } catch {
          // Wrapped error handled
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!db || !user) return;

    setUpdatingTaskId(taskId);
    setError(null);

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status.');
      try {
        handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
      } catch {
        // Logged
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'ALL') return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      planned: tasks.filter((t) => t.status === 'Planned').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      complete: tasks.filter((t) => t.status === 'Complete').length,
    };
  }, [tasks]);

  const formatDate = (timestamp: Task['createdAt']) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Your Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing tasks belonging to your account ({tasks.length} total)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Planned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'Planned'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Planned ({counts.planned})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('In Progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'In Progress'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Progress ({counts.inProgress})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Complete')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'Complete'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Complete ({counts.complete})
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs text-red-600 hover:text-red-900 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">Loading your tasks...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching records from Cloud Firestore</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your task list is empty. Use the form above to add your first task.
          </p>
        </div>
      )}

      {/* Filtered Empty State */}
      {!loading && tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Filter className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">
            No tasks match the selected status filter: &ldquo;{statusFilter}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            Clear status filter
          </button>
        </div>
      )}

      {/* Task List Cards */}
      {!loading && filteredTasks.length > 0 && (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.Planned;
            const isUpdating = updatingTaskId === task.id;

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Task Content */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.badgeClass}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        Created: {formatDate(task.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                      {task.title}
                    </h3>

                    {task.description ? (
                      <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line break-words leading-relaxed pt-1">
                        {task.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic pt-0.5">
                        No description provided.
                      </p>
                    )}
                  </div>

                  {/* Status Selector Control */}
                  <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex items-center sm:flex-col sm:items-end justify-between gap-1.5">
                    <label
                      htmlFor={`status-select-${task.id}`}
                      className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block"
                    >
                      Update Status
                    </label>

                    <div className="relative">
                      <select
                        id={`status-select-${task.id}`}
                        value={task.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-300 px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {STATUS_OPTIONS.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>

                      {isUpdating && (
                        <div className="absolute right-2 top-2">
                          <div className="w-3 h-3 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
