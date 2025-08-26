import React from "react";
import PropTypes from "prop-types";

function RedFlagsPage({ redFlagsList, selectedFlags, handleFlagSelect, handlePrevious, handleSubmit }) {
  return (
    <div className="redflags-page">
      <div className="profile-title-container">
        <div className="profile-title">Red Flags</div>
        <div className="profile-paw-print">
          <div className="profile-paw-image">
            <img src={`${process.env.PUBLIC_URL}/static/image/g3023.svg`} alt="Paw Print" />
          </div>
        </div>
      </div>
      <div className="flag-grid">
        {redFlagsList.map((flag) => (
          <button
            key={flag.id}
            className={`flag-card ${
              selectedFlags.includes(flag) ? "selected" : ""
            } ${
              selectedFlags.length >= 3 &&
              !selectedFlags.includes(flag) ? "disabled" : ""
            }`}
            onClick={() => handleFlagSelect(flag)}
          >
            <span className="flag-name">{flag.name}</span>
          </button>
        ))}
      </div>
      <p className="selection-counter">{selectedFlags.length}/3</p>
      <div className="button-container">
        <button type="button" className="next-button" onClick={handlePrevious}>
          Previous
        </button>
        <button type="button" className="next-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

RedFlagsPage.propTypes = {
  redFlagsList: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, name: PropTypes.string })
  ).isRequired,
  selectedFlags: PropTypes.array.isRequired,
  handleFlagSelect: PropTypes.func.isRequired,
  handlePrevious: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

export default RedFlagsPage;