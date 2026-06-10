import { useEffect, useState } from 'react';
import { useReportsStore } from '../store/reportsStore';
import { useListingsStore } from '../store/listingsStore';
import { useUsersStore } from '../store/usersStore';
import { ShieldAlert, Trash2, CheckCircle, UserX } from 'lucide-react';

export const Reports = () => {
  const { reports, subscribeToReports, updateReportStatus, deleteReport } = useReportsStore();
  const { listings, deleteListing, subscribeToListings } = useListingsStore();
  const { users, updateUserStatus, subscribeToUsers } = useUsersStore();

  useEffect(() => {
    subscribeToReports();
    subscribeToListings();
    subscribeToUsers();
  }, [subscribeToReports, subscribeToListings, subscribeToUsers]);

  const [statusFilter, setStatusFilter] = useState('pending');

  const filteredReports = reports.filter(r => r.status === statusFilter);

  const getListing = (id: string) => listings.find(l => l.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Moderation</h1>
          <p className="text-gray-500 text-sm mt-1">Review flagged listings and take action against spammers.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'pending' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'resolved' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <ShieldAlert className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-800">No {statusFilter} reports</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          filteredReports.map(report => {
            const listing = getListing(report.listingId);
            const reporter = getUser(report.reporterId);
            const owner = listing ? getUser(listing.sellerId) : null;

            return (
              <div key={report.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide rounded-full mb-2">
                        {report.reason}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {listing?.title || 'Unknown Listing'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Reported by: <span className="font-semibold text-gray-700">{reporter?.name || report.reporterId}</span> on {report.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm font-medium text-gray-600 mb-2">Listing Owner:</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/20 text-gold rounded-full flex items-center justify-center font-bold">
                          {owner ? owner.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{owner?.name || listing?.sellerName || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{owner?.email || 'No email'}</p>
                        </div>
                      </div>
                      {owner && owner.status !== 'suspended' && (
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to suspend ${owner.name}?`)) {
                              updateUserStatus(owner.id, 'suspended');
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <UserX size={16} /> Block User
                        </button>
                      )}
                      {owner?.status === 'suspended' && (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Suspended</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 justify-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  {statusFilter === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateReportStatus(report.id, 'resolved')}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-bold transition-colors"
                      >
                        <CheckCircle size={18} /> Mark Resolved
                      </button>
                      {listing && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this listing permanently?')) {
                              deleteListing(listing.id);
                              updateReportStatus(report.id, 'resolved');
                            }
                          }}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                        >
                          <Trash2 size={18} /> Delete Listing
                        </button>
                      )}
                    </>
                  )}
                  {statusFilter === 'resolved' && (
                    <button 
                      onClick={() => deleteReport(report.id)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold transition-colors"
                    >
                      <Trash2 size={18} /> Delete Report
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
