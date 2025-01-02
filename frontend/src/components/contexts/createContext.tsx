import { createContext, useContext } from "react";

export const createContextProvider = <T,>(
    name: string,
    initialValue: T
) => {
    const Context = createContext<T | undefined>(undefined);

    const useGenericContext = (): T => {
        const ctx = useContext(Context);
        if (!ctx) {
            throw new Error(`${name} must be used within its provider.`);
        }
        return ctx;
    };

    return { Context, useGenericContext };
};
