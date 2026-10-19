import React from 'react';

const LOGO_URL = '/alufen-logo.png';

const SUPPLIER = {
  name: 'ALUMINIUM FENCES s.r.o.',
  street: 'Hemy 830',
  city: 'Valašské Meziříčí 75701',
  country: 'Česko',
};

export default function OfferPrintView({ customer, items, offerNumber, date }) {
  const total = items.reduce((sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.unitPrice) || 0), 0);
  const vat = total * 0.21;
  const totalWithVat = total + vat;

  // Validity: 30 days from today
  const validUntil = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('cs-CZ');
  })();

  return (
    <div id="offer-print" style={{ fontFamily: 'Arial, Helvetica, sans-serif', background: 'white', color: '#1e293b' }}>
      <style>{`
        @media print {
          body { margin: 0; }
          #offer-print { display: block !important; }
        }
      `}</style>

      <div style={{ padding: '40px 48px' }}>

        {/* Header: title + logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0, lineHeight: 1.25, maxWidth: '60%' }}>
            Cenová nabídka{customer.name ? ` ${customer.name}` : ''}
          </h1>
          <img src={LOGO_URL} alt="Alufen" style={{ height: '60px', objectFit: 'contain' }} />
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '28px' }}>
          <span>Nabídka je platná do {validUntil}</span>
          <span>Datum vytvoření {date} · č. {offerNumber}</span>
        </div>

        {/* Supplier block (green card) */}
        <div style={{ backgroundColor: '#16a34a', borderRadius: '10px', padding: '20px 24px', marginBottom: '28px', display: 'inline-block', minWidth: '260px' }}>
          <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Dodavatel</div>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>{SUPPLIER.name}</div>
          <div style={{ color: '#d1fae5', fontSize: '13px', lineHeight: '1.6' }}>
            {SUPPLIER.street}<br />
            {SUPPLIER.city}<br />
            {SUPPLIER.country}
          </div>
        </div>

        {/* Customer section */}
        {customer.name && (
          <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '28px', paddingBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Zákazník</div>
            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
              <div>{customer.name}</div>
              {customer.address && <div>{customer.address}</div>}
              {customer.email && <div>{customer.email}</div>}
              {customer.phone && <div>{customer.phone}</div>}
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Položky</div>
          {items.map((item, idx) => {
            const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingTop: '14px', paddingBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {item.qty} {item.unit} × {parseFloat(item.unitPrice).toLocaleString('cs-CZ')} Kč
                  </div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#16a34a', whiteSpace: 'nowrap', marginLeft: '24px' }}>
                  {lineTotal.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč
                </div>
              </div>
            );
          })}
        </div>

        {/* Total block (green) */}
        <div style={{ backgroundColor: '#16a34a', borderRadius: '10px', padding: '24px 32px', textAlign: 'right' }}>
          <div style={{ color: '#d1fae5', fontSize: '13px', marginBottom: '4px' }}>
            Celková cena s DPH 21 %
          </div>
          <div style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.5px', margin: '6px 0' }}>
            {totalWithVat.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč
          </div>
          <div style={{ color: '#d1fae5', fontSize: '12px' }}>
            ( {total.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč bez DPH, DPH {vat.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč )
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
          Nabídka je platná 30 dní od data vystavení.
        </div>

      </div>
    </div>
  );
}