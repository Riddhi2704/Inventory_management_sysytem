import React from 'react';
import { Package } from 'lucide-react';

export default function TopProductsChart({ data, loading }) {
  if (loading) return <div className="ac-chart-container ac-skeleton"></div>;

  const maxSales = Math.max(...data.map(item => item.sales), 1);

  return (
    <div className="ac-panel ac-panel-half">
      <div className="ac-panel-header" style={{ marginBottom: '16px' }}>
        <div className="ac-panel-title-wrapper">
          <div className="ac-icon-box primary"><Package size={20} /></div>
          <div>
            <h3 className="ac-panel-title">Top Selling Products</h3>
            <div className="ac-panel-subtitle">Highest volume movers</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        {data.map((product, index) => {
          const percentage = (product.sales / maxSales) * 100;
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--ac-radius-sm)', backgroundColor: 'var(--ac-bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ac-text-muted)', fontWeight: 700, fontSize: '0.875rem', border: '1px solid var(--ac-border)' }}>
                    #{index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ac-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={product.name}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ac-text-muted)', fontWeight: 500 }}>
                      ₹{product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>{product.sales}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--ac-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Sales</div>
                </div>
              </div>
              
              {/* Progress Bar inside Top Products */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--ac-bg-main)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--ac-primary)', borderRadius: '99px', transition: 'width 1s ease-in-out' }}></div>
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ac-text-muted)', fontSize: '0.875rem' }}>
            No top products available.
          </div>
        )}
      </div>
    </div>
  );
}
