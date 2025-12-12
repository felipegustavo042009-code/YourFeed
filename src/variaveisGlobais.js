import { createContext, useState} from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [idLocal, setId] = useState(null);   // variável global
    const [tipoLocal, setTipo] = useState("");      // outra variável global

    return (
        <GlobalContext.Provider value={{ idLocal, setId, tipoLocal, setTipo }}>
            {children}
        </GlobalContext.Provider>
    );
};

