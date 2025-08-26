import React from "react";
import PropTypes from "prop-types";

function PhotosPage({ photos, triggerFileInput, handleDeletePhoto, fileInputRef, onPhotoChange, handlePrevious, handleNext }) {
  const selectedCount = photos.filter((p) => p !== null).length;
  return (
    <div className="adding-photos">
      <div className="profile-title-container">
        <div className="profile-title">Adding photos for your pet!</div>
        <div className="profile-paw-print">
          <div className="profile-paw-image">
            <img src={`${process.env.PUBLIC_URL}/static/image/g3023.svg`} alt="Paw Print" />
          </div>
        </div>
      </div>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div className="photo-frame" key={index}>
            {photo ? (
              <div className="photo-container">
                <img src={photo} alt={`Pet ${index + 1}`} className="photo" />
                <button
                  className="delete-button"
                  onClick={() => handleDeletePhoto(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <button className="add-photo-button" onClick={triggerFileInput}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="photo-count">{selectedCount}/6</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onPhotoChange}
        className="upload-input"
      />
      <div className="button-container">
        <button type="button" className="next-button" onClick={handlePrevious}>
          Previous
        </button>
        <button type="button" className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

PhotosPage.propTypes = {
  photos: PropTypes.array.isRequired,
  triggerFileInput: PropTypes.func.isRequired,
  handleDeletePhoto: PropTypes.func.isRequired,
  fileInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]).isRequired,
  onPhotoChange: PropTypes.func.isRequired,
  handlePrevious: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired
};

export default PhotosPage;