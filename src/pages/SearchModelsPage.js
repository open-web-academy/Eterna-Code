import React, { useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { abi } from '../config/abi';

const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function SearchModelsPage() {
  const account = useAccount();
  const [searchWallet, setSearchWallet] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);

  // Get models for current wallet or searched wallet
  const { data: models, isError, isLoading } = useReadContract({
    address: '0xB59f727832e52EADA1bE6f1a62e1d1806a2d1dfa',
    abi,
    functionName: 'getUserEntries',
    args: [searchWallet || account?.address || ''],
    enabled: Boolean(searchWallet) || Boolean(account?.address)
  });
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchWallet) {
      setIsValidAddress(false);
      return;
    }
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(searchWallet);
    setIsValidAddress(isValid);
  };

  return (
    <div className="container py-4">
      <h1 className='fw-bold pb-4'>Search AI Models</h1>
      
      {!account.isConnected && (
        <div className="alert alert-info mb-4">
          <p>No wallet connected. You can still search for other users' models.</p>
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${!isValidAddress ? 'is-invalid' : ''}`}
            placeholder="Enter wallet address (0x...)"
            value={searchWallet}
            onChange={(e) => setSearchWallet(e.target.value)}
          />
          <button className="btn btn-success" type="submit">
            Search
          </button>
        </div>
        {!isValidAddress && (
          <div className="invalid-feedback d-block">
            Please enter a valid wallet address
          </div>
        )}
      </form>

      {/* Loading State */}
      {isLoading && <div>Loading models...</div>}

      {/* Error State */}
      {isError && (
        <div className="alert alert-danger">
          Error loading models. Please try again.
        </div>
      )}

      {/* Models List */}
      {models && (
        <div className="list-group">
          {models.length > 0 ? (
            models.map((modelName, index) => (
              <Link
                key={index}
                to={`/aimodel/${searchWallet || account?.address}/${modelName}`}
                className="list-group-item list-group-item-action"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{modelName}</h5>
                    <small className="text-muted">
                      Owner: {formatAddress(searchWallet || account?.address)}
                    </small>
                  </div>
                  <span className="badge bg-success rounded-pill">→</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="alert alert-info">
              {searchWallet ? (
                <p>No models found for wallet address: {searchWallet}</p>
              ) : account.isConnected ? (
                <p>No models found for your wallet. Create your first AI model!</p>
              ) : (
                <p>Enter a wallet address to search for models.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}