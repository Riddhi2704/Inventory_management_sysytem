import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ScanBarcode, Loader2, CheckCircle2, XCircle, ArrowRightCircle } from 'lucide-react';

const BarcodeScannerWidget = ({ onActionRedirect }) => {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize Scanner when component mounts
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText, decodedResult) {
      if (decodedText !== scanResult) {
        setScanResult(decodedText);
        scanner.pause(true); // Pause scanning after a successful read
        fetchProductByBarcode(decodedText);
      }
    }

    function onScanFailure(error) {
      // Html5QrcodeScanner throws errors constantly when it doesn't see a code
      // We ignore these to prevent console spam.
    }

    return () => {
      // Cleanup when unmounting
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [scanResult]); // Dependency on scanResult to prevent double scanning

  const fetchProductByBarcode = async (barcode) => {
    setLoading(true);
    setError('');
    setProductData(null);
    try {
      // Search by exact productId/SKU or name (our backend allows both)
      // We assume barcode is the productId (SKU)
      const res = await axios.get(`http://127.0.0.1:5000/api/products?search=${barcode}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (res.data && res.data.length > 0) {
        // Find exact match if multiple returned, otherwise just take the first
        const exactMatch = res.data.find(p => p.productId === barcode) || res.data[0];
        setProductData(exactMatch);
      } else {
        setError(`No product found in inventory with barcode: ${barcode}`);
      }
    } catch (err) {
      console.error('Failed to fetch product by barcode', err);
      setError('Error scanning: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resumeScanning = () => {
    setScanResult(null);
    setProductData(null);
    setError('');
    setManualBarcode('');
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      setScanResult(manualBarcode);
      if (scannerRef.current) scannerRef.current.pause(true);
      fetchProductByBarcode(manualBarcode.trim());
    }
  };

  return (
    <div className="sd-card">
      <div className="sd-card-header">
        <ScanBarcode size={24} style={{ color: 'var(--sd-primary-color)' }} />
        <h3 className="sd-card-title">Live Barcode Scanner</h3>
      </div>
      <p style={{ color: 'var(--sd-text-muted)', marginBottom: '1.5rem' }}>
        Use your device camera to scan a product barcode (SKU) and view live inventory details.
      </p>

      {/* The HTML5 QR Code Scanner container */}
      <div style={{ display: scanResult ? 'none' : 'block', marginBottom: '1.5rem' }}>
        <div id="reader" width="100%"></div>
        
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--sd-border-color)', paddingTop: '1.5rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: '500' }}>OR ENTER MANUALLY</p>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px', margin: '0 auto' }}>
            <input 
              type="text" 
              className="sd-input" 
              placeholder="Enter Barcode / SKU" 
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="sd-btn sd-btn-primary" disabled={loading || !manualBarcode.trim()}>
              Search
            </button>
          </form>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sd-text-muted)' }}>
          <Loader2 className="animate-spin inline mr-2" /> Searching inventory...
        </div>
      )}

      {error && (
        <div className="sd-alert-card mb-4" style={{ backgroundColor: 'var(--sd-status-rejected-bg)', borderColor: 'var(--sd-status-rejected-text)' }}>
          <div className="sd-alert-icon" style={{ color: 'var(--sd-status-rejected-text)' }}>
            <XCircle size={24} />
          </div>
          <div className="sd-alert-content">
            <h4 className="sd-alert-title" style={{ color: 'var(--sd-status-rejected-text)' }}>Scan Failed</h4>
            <p className="sd-alert-text">{error}</p>
          </div>
        </div>
      )}

      {productData && !loading && (
        <div style={{ border: '1px solid var(--sd-border-color)', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'var(--sd-bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--sd-border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 color="#16a34a" size={24}/>
              <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{productData.name}</h4>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: productData.status === 'Active' ? '#dcfce7' : '#fef9c3', color: productData.status === 'Active' ? '#166534' : '#854d0e', fontWeight: '700', textTransform: 'uppercase' }}>
              {productData.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>SKU / Barcode</div>
              <div style={{ fontWeight: '600' }}>{productData.productId}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>Category</div>
              <div style={{ fontWeight: '600' }}>{productData.category?.name || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>Current Stock</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: productData.quantity <= (productData.minStockLevel || 50) ? '#ef4444' : '#16a34a' }}>
                {productData.quantity} Units
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>Location</div>
              <div style={{ fontWeight: '600' }}>{productData.storageLocation || 'Unassigned'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>Price</div>
              <div style={{ fontWeight: '600' }}>${productData.sellingPrice?.toFixed(2) || '0.00'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>Supplier</div>
              <div style={{ fontWeight: '600' }}>{productData.supplier?.name || 'N/A'}</div>
            </div>
          </div>
          
          {onActionRedirect && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
               <button 
                  onClick={() => onActionRedirect('move', productData)} 
                  className="sd-btn sd-btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <ArrowRightCircle size={20} />
                  Record Movement for this Product
               </button>
            </div>
          )}
        </div>
      )}

      {scanResult && !loading && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button onClick={resumeScanning} className="sd-btn sd-btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
            Scan Another Item
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScannerWidget;
