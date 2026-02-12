import React from 'react';
import { Result, Button } from 'antd';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Result
      status="error"
      title="Algo salio mal"
      subTitle={error?.message || 'Ha ocurrido un error inesperado'}
      extra={
        resetErrorBoundary && (
          <Button type="primary" onClick={resetErrorBoundary}>
            Intentar de nuevo
          </Button>
        )
      }
    />
  );
};
