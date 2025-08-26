import React from "react";
import PropTypes from "prop-types";

function CharactersPage({ charactersList, selectedCharacters, handleCharacterSelect, handlePrevious, handleNext }) {
  return (
    <div className="characters-page">
      <div className="profile-title-container">
        <div className="profile-title">Select Your Pet's Character</div>
        <div className="profile-paw-print">
          <div className="profile-paw-image">
            <img src={`${process.env.PUBLIC_URL}/static/image/g3023.svg`} alt="Paw Print" />
          </div>
        </div>
      </div>
      <div className="character-grid">
        {charactersList.map((character) => (
          <button
            key={character.id}
            className={`character-card ${
              selectedCharacters.includes(character) ? "selected" : ""
            } ${
              selectedCharacters.length >= 3 &&
              !selectedCharacters.includes(character) ? "disabled" : ""
            }`}
            onClick={() => handleCharacterSelect(character)}
          >
            <span className="character-name">{character.name}</span>
          </button>
        ))}
      </div>
      <p className="selection-counter">{selectedCharacters.length}/3</p>
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

CharactersPage.propTypes = {
  charactersList: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, name: PropTypes.string })
  ).isRequired,
  selectedCharacters: PropTypes.array.isRequired,
  handleCharacterSelect: PropTypes.func.isRequired,
  handlePrevious: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired
};

export default CharactersPage;