const InfoItem = ({ label, value }) => {
    const formatValue = (value) => {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).join(', ');
      }
      return value || 'N/A';
    };
  
    return (
      <div className="info-item">
        <span className="label-text">{label}:</span>
        <span className="info-value">{formatValue(value)}</span>
      </div>
    );
  };

  export default InfoItem;