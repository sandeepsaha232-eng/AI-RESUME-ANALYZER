import { Bell, Check, Info, AlertTriangle, CheckCircle, Trash2, XCircle } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll
}: NotificationCenterProps) {
  
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />;
      default:
        return <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" />;
    }
  };

  const getNotificationBg = (item: AppNotification) => {
    if (!item.read) {
      return 'bg-blue-50/20 dark:bg-blue-950/15 border-blue-100/50 dark:border-blue-900/40';
    }
    return 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/50';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center space-x-2.5">
            <Bell className="w-7 h-7 text-blue-500" />
            <span>Notification Center</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans font-light mt-1">
            Review status updates, parsing reports, and cloud synchronization timelines.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onMarkAllRead}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClearAll}
              className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-650 dark:bg-slate-850 dark:hover:bg-red-950/10 text-slate-500 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear history</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Alert List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Inbox is completely clear</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light leading-normal">
                No telemetry alerts or notifications compiled yet. We will notify you here when resume analyses finish.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && onMarkRead(item.id)}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all cursor-pointer ${getNotificationBg(item)}`}
              >
                <div className="flex items-start space-x-3.5 max-w-[85%]">
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm tracking-tight leading-snug font-sans ${item.read ? 'font-medium text-slate-700 dark:text-slate-350' : 'font-extrabold text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                      {item.body}
                    </p>
                    <span className="block text-xxs text-slate-400 dark:text-slate-550 font-medium">
                      {new Date(item.createdAt).toLocaleTimeString()} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(item.id);
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Mark Read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
