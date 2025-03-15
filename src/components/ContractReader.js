import React from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { abi } from '../config/abi';

export default function ContractReader() {
  const account = useAccount();

  // 1. getAccessibleEntries call
  const {
    data: accessibleEntries,
    isLoading: isLoadingEntries,
    isError: isErrorEntries,
    error: errorEntries
  } = useReadContract({
    address: '0xB59f727832e52EADA1bE6f1a62e1d1806a2d1dfa',
    abi,
    functionName: 'getAccessibleEntries'
  });
  console.log('accessibleEntries', accessibleEntries);

  // 2. getCurrentText call
  const {
    data: currentText,
    isLoading: isLoadingText,
    isError: isErrorText,
    error: errorText
  } = useReadContract({
    address: '0xB59f727832e52EADA1bE6f1a62e1d1806a2d1dfa',
    abi,
    functionName: 'getCurrentText',
    args: [account.address, 'test4']
  });

  return (
    <div>
      <h2>Contract Reader Test</h2>
      
      <div>
        <h3>Accessible Entries</h3>
        {isLoadingEntries && <p>Loading entries...</p>}
        {isErrorEntries && <p>Error: {errorEntries?.message}</p>}
        {accessibleEntries && (
          <pre>{}</pre>
        )}
      </div>

      <div>
        <h3>Current Text</h3>
        {isLoadingText && <p>Loading text...</p>}
        {isErrorText && <p>Error: {errorText?.message}</p>}
        {currentText && (
          <div>
            <p>Text: {currentText[0]}</p>
            <p>Created At: {currentText[1]?.toString()}</p>
            <p>Updated At: {currentText[2]?.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}