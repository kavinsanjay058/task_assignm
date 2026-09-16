import React from 'react';
import { Navbar } from './Navbar';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Create Task Form */}
        <section aria-labelledby="create-task-heading">
          <TaskForm />
        </section>

        {/* Task List */}
        <section aria-labelledby="task-list-heading">
          <TaskList />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          TaskFlow &bull; Graduate Support Engineer Trainee Assessment &bull; Google Auth &amp; Firestore
        </div>
      </footer>
    </div>
  );
};
