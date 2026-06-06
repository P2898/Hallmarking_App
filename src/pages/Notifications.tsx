import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ShieldAlert, 
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationsStore, type AdminNotification } from '../store/notificationsStore';

export const Notifications = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useNotificationsStore();

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {

      case 'listing_pending':
        return <FileCheck className="text-blue-600" size={18} />;
      case 'chat_flagged':
        return <ShieldAlert className="text-red-600" size={18} />;
      default:
        return <Bell className="text-gray-600" size={18} />;
    }
  };

  const getBg = (type: AdminNotification['type']) => {
    switch (type) {

      case 'listing_pending':
        return 'bg-blue-50 border-blue-100';
      case 'chat_flagged':
        return 'bg-red-50 border-red-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Log & Alerts</h2>
          <p className="text-xs text-gray-400">Track critical actions, reports, and pending verifications on the platform</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-dark bg-gold hover:bg-gold-dark rounded-xl shadow-sm transition-all"
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            No system notifications found.
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                notif.read ? 'bg-white' : 'bg-gold/5 font-semibold'
              }`}
            >
              {/* Icon */}
              <div className={`p-2.5 rounded-xl border ${getBg(notif.type)} flex-shrink-0`}>
                {getIcon(notif.type)}
              </div>

              {/* Text details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{notif.description}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 self-center">
                {!notif.read && (
                  <button 
                    onClick={() => markNotificationRead(notif.id)}
                    className="text-[10px] font-bold text-gray-400 hover:text-dark hover:bg-gray-100 px-2 py-1 rounded border border-gray-200 transition-colors"
                  >
                    Mark read
                  </button>
                )}

                {notif.link && (
                  <Link 
                    to={notif.link}
                    className="p-1.5 text-gray-400 hover:text-gold border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Navigate to screen"
                  >
                    <ExternalLink size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
