import { useEffect } from 'react';

export default function AlertToast({ message, type = 'error', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message]);

  const style = type === 'success'
    ? { background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d' }
    : { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' };

  return (
    <div className="alert-inline" style={style}>
      {message}
    </div>
  );
}
