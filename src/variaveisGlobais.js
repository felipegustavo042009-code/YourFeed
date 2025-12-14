import { createContext, useState} from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [idLocal, setId] = useState(null);
    const [tipoLocal, setTipo] = useState("");  
    const [nomeLocal, setNomeLocal] = useState(""); 
    const [salaLocal, setSalaLocal] = useState("");   



    return (
        <GlobalContext.Provider value={{ idLocal, setId, tipoLocal, setTipo, nomeLocal, setNomeLocal, salaLocal, setSalaLocal }}>
            {children}
        </GlobalContext.Provider>
    );
};

