import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MyFiles from './pages/MyFiles';
import Shared from './pages/Shared';
import Trash from './pages/Trash';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import SharedFile from './pages/SharedFile';
import ProtectedRoute from './components/ProtectedRoute';
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketContext';
import { ShareNotificationModal } from './components/ShareNotificationModal';

import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { pendingNotification, clearNotification } = useWebSocket();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<MyFiles />} />
          <Route path="/shared" element={<Shared />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shares/:token" element={<SharedFile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Share Notification Modal */}
      {pendingNotification && (
        <ShareNotificationModal
          shareId={pendingNotification.shareId}
          fileName={pendingNotification.fileName}
          ownerName={pendingNotification.ownerName}
          ownerEmail={pendingNotification.ownerEmail}
          onClose={clearNotification}
          onAction={() => {
            // Optionally refresh shares list or navigate to shared page
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </Router>
  );
}

export default App;
