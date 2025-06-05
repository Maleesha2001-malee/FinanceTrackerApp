import React from 'react';

function StatusMessage({ message }) {
  return (
    <div className={`mx-6 mt-4 p-3 rounded-md ${
      message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`}>
      {message.text}
    </div>
  );
}

export default StatusMessage;