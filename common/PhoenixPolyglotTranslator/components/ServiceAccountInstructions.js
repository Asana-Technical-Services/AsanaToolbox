import React from 'react';

const ServiceAccountInstructions = ({ selectedWorkspace }) => {
  const serviceAccountsUrl = `https://app.asana.com/admin/${selectedWorkspace}/apps/serviceaccounts`;

  return (
    <div className="mt-4 mb-4">
      <p>
        If you don't have a service account yet, you can create one by following{' '}
        <a 
          href={serviceAccountsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          this link
        </a>.
      </p>
    </div>
  );
};

export default ServiceAccountInstructions;