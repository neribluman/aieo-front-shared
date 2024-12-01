import React from 'react';

interface TransitionWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({ 
  children, 
  isVisible 
}) => {
  return (
    <div
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'page-transition-enter' : 'page-transition-exit'}
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="content-transition">
        {children}
      </div>
    </div>
  );
};

export default TransitionWrapper; 