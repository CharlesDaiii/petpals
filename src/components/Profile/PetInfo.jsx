import InfoItem from "./InfoItem";

const PetInfo = ({ petData }) => {
    const {
      name,
      sex,
      breed,
      birth_date,
      weight,
      preferred_time,
      location,
      health_states,
      characters,
      red_flags,
    } = petData;
  
    const calculateAge = (birthDate) => {
      return new Date().getFullYear() - new Date(birthDate).getFullYear();
    };
  
    return (
      <div className="group">
        <span className="span">{name}</span>
        <div className="info-grid">
          <InfoItem label="Sex" value={sex} />
          <InfoItem label="Breed" value={breed} />
          <InfoItem label="Dog-walking Time" value={preferred_time} />
          <InfoItem label="Age" value={`${calculateAge(birth_date)} years old`} />
          <InfoItem label="Weight" value={`${weight} lbs`} />
          <InfoItem label="Location" value={location} />
          <InfoItem label="Health States" value={health_states} />
          <InfoItem label="Character" value={characters} />
          <InfoItem label="Red Flags" value={red_flags} />
        </div>
      </div>
    );
  };

  export default PetInfo;