'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
    selectedSkill: string | null;
    setSelectedSkill: (skill: string | null) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    return (
        <FilterContext.Provider value={{ selectedSkill, setSelectedSkill }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
};
