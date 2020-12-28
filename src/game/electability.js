/*

Electability
---------

This script handles the electability mechanic

Arguments
---------
    publicSupport: how much the public supports the players' policies as a pct (int [0-100]);
    businessSupport: how much businesses support the players' policies as a pct (int [0-100]);
    healthcareSupport: how much the healthcare services support the players' policies as a pct (int [0-100]);

*/

// Calculate electability from how much suppport the player has from the public, businesses and healthcare
export const calculateElectability = (publicSupport, businessSupport, healthcareSupport) => {
    return (publicSupport + businessSupport + healthcareSupport) / 3;
};