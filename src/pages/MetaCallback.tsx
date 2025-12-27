import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const MetaCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      setStatus('success');
      setMessage('¡Cuenta de Meta Ads conectada exitosamente!');
      setTimeout(() => navigate('/dashboard'), 3000);
    } else if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
    } else {
      setStatus('loading');
      setMessage('Procesando conexión...');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Procesando</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">¡Conexión Exitosa!</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground">Redirigiendo al dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Error de Conexión</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Volver al Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;
