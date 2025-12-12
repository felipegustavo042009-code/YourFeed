import { createContext, useState } from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);   // variável global
    const [tema, setTema] = useState("light");      // outra variável global

    return (
        <GlobalContext.Provider value={{ usuario, setUsuario, tema, setTema }}>
            {children}
        </GlobalContext.Provider>
    );
};