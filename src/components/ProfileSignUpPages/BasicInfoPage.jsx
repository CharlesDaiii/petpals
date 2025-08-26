import React from "react";
import Select from "react-select";
import PropTypes from "prop-types";

function BasicInfoPage({ formData, errors, handleInputChange, handleSelectChange, handleNext, locationInputRef }) {
  return (
    <div className="form-container">
      <div className="profile-title-container">
        <div className="profile-title">Profile Sign Up</div>
        <div className="profile-paw-print">
          <div className="profile-paw-image">
            <img src={`${process.env.PUBLIC_URL}/static/image/g3023.svg`} alt="Paw Print" />
          </div>
        </div>
      </div>
      <form className="form-grid">
        <label>
          Pet Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            maxLength="20"
            className={`input-field ${errors.name ? 'error' : ''}`}
            placeholder="Enter pet's name"
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </label>
        <label>
          Birth Date:
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleInputChange}
            className={`input-field ${errors.birth_date ? 'error' : ''}`}
          />
          {errors.birth_date && <div className="error-text">{errors.birth_date}</div>}
        </label>
        <label>
          Breed:
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Enter breed"
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Enter location"
            ref={locationInputRef}
            autoComplete="off"
          />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </label>
        <label>
          Sex:
          <select
            name="sex"
            value={formData.sex}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Neutered">Neutered</option>
          </select>
        </label>
        <label>
          Preferred Time:
          <select
            name="preferred_time"
            value={formData.preferred_time}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="">Select</option>
            <option value="Morning">Morning</option>
            <option value="Midday">Midday</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </label>
        <label>
          Weight (LBS):
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            max="200"
            className={`input-field ${errors.weight ? 'error' : ''}`}
            placeholder="Enter weight"
          />
          {errors.weight && <div className="error-text">{errors.weight}</div>}
        </label>
        <label>
          Health State:
          <Select
            isMulti
            options={[
              { value: "rabies", label: "Rabies" },
              { value: "dhlpp", label: "DHLPP" },
              { value: "bordetella", label: "Bordetella" },
              { value: "heartworm", label: "Heartworm Prevention" },
              { value: "lyme", label: "Lyme Disease" },
              { value: "leptospirosis", label: "Leptospirosis" },
              { value: "influenza", label: "Canine Influenza" }
            ]}
            onChange={handleSelectChange}
            classNamePrefix="select"
            placeholder="Select health state"
          />
        </label>
      </form>
      <div className="button-container">
        <button type="button" className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

BasicInfoPage.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSelectChange: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  locationInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ])
};

export default BasicInfoPage;