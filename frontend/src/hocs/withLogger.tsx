import React, { ComponentType, useEffect } from 'react';

const withLogger = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithLogger: React.FC<P> = (props) => {
    useEffect(() => {
      console.log(`[Component Mount] ${WrappedComponent.name}`);
      return () => {
        console.log(`[Component Unmount] ${WrappedComponent.name}`);
      };
    }, []);

    useEffect(() => {
      console.log(`[Component Update] ${WrappedComponent.name}`, { props });
    });

    return <WrappedComponent {...props} />;
  };

  WithLogger.displayName = `WithLogger(${WrappedComponent.name})`;
  return WithLogger;
};

export default withLogger; 