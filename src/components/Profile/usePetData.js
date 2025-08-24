import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const usePetData = () => {
    const { id } = useParams();
    const [petData, setPetData] = useState(null);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchPetData = async () => {
        try {
          // Conditionally fetch pet data based on the id
          // if id is not provided, fetch the pet data of the current user
          if (id) {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user-pet/${id}/`, {
              method: "GET",
              credentials: "include",
            });
            if (response.ok) {
              const data = await response.json();
              setPetData(data);
            } else {
              const errorData = await response.json();
              setError(errorData.error || "Failed to fetch pet data.");
            }
          } else {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user-pet/`, {
              method: "GET",
              credentials: "include",
            });
            if (response.ok) {
              const data = await response.json();
              setPetData(data);
            } else {
              const errorData = await response.json();
              setError(errorData.error || "Failed to fetch pet data.");
            }
          }
        } catch (err) {
          setError(err.message);
        }
      };
  
      fetchPetData();
    }, []);
  
    return { petData, error };
  };

  export default usePetData;