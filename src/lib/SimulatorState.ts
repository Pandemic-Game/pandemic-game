/**
 * Represents the initial state of the game world.
 */
export interface GameWorld {
    totalPopulation: number
    wellbeing: number
    initialNumInfected: number
    importedCasesPerDay: number
    r0: number
    hospitalCapacity: number
    gdpPerDay: number
    power: number
    distr_family: string
    dynamics: string
    time_lumping: boolean
}

/**
 * Represents the state of the simulation on a given turn.
 */
export interface WorldState {
    days: number  // Number of days since the start of the simulation
    totalPopulation: number
    numInfected: number
    numDead: number
    importedCases: number
    r: number
    hospitalCapacity: number
    medicalCosts: number
    economicCosts: number
    deathCosts: number
    wellbeing: number
}