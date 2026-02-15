// Exempeldata: raffinaderiprocess med alla komponenttyper
export const processData = {
    name: "Raffinaderiprocess",
    description: "Demonstrationsprocess med kärl, pumpar, ventiler, VVX, kolonn, kompressor, reaktor och ugn",

    components: [
        // --- Övre raden: huvudprocess (z = 0) ---
        {
            id: "V-101",
            type: "tank",
            name: "Råvarukärl V-101",
            description: "Lagerkärl för råvara (feed). Kapacitet: 50 m³.",
            position: { x: -16, y: 0, z: 0 }
        },
        {
            id: "P-101",
            type: "pump",
            name: "Matarpump P-101",
            description: "Centrifugalpump för matning av råvara. Flöde: 10 m³/h.",
            position: { x: -12, y: 0, z: 0 }
        },
        {
            id: "F-101",
            type: "furnace",
            name: "Processugn F-101",
            description: "Eldad rörvärmare (fired heater). Värmer feed till reaktionstemperatur. Effekt: 500 kW.",
            position: { x: -8, y: 0, z: 0 }
        },
        {
            id: "R-101",
            type: "reactor",
            name: "Reaktor R-101",
            description: "Omrörd tankreaktor med kylmantel. Volym: 15 m³, Tryck: 5 bar, Temp: 250°C.",
            position: { x: -3, y: 0, z: 0 }
        },
        {
            id: "E-101",
            type: "heatExchanger",
            name: "Produktkylare E-101",
            description: "Rörbuntsvärmeväxlare (shell & tube). Kyler reaktorprodukt. Effekt: 300 kW.",
            position: { x: 2, y: 0, z: 0 }
        },
        {
            id: "C-101",
            type: "column",
            name: "Destillationskolonn C-101",
            description: "Fraktioneringskolonn med 5 bottnar. Tryck: 2 bar, Topp: 80°C, Botten: 150°C.",
            position: { x: 7, y: 0, z: 0 }
        },
        {
            id: "FCV-101",
            type: "valve",
            name: "Flödesreglerventil FCV-101",
            description: "Flödesreglerande ventil (Flow Control Valve). Typ: Globe valve, DN50.",
            position: { x: 11, y: 0, z: 0 }
        },
        {
            id: "V-102",
            type: "tank",
            name: "Produktkärl V-102",
            description: "Lagerkärl för färdig produkt. Kapacitet: 30 m³.",
            position: { x: 15, y: 0, z: 0 }
        },

        // --- Nedre raden: gasåtervinning + retur (z = -10) ---
        {
            id: "K-101",
            type: "compressor",
            name: "Gaskompressor K-101",
            description: "Centrifugalkompressor för gasåtervinning från kolonntopp. Tryckförhållande: 3:1.",
            position: { x: 7, y: 0, z: -10 }
        },
        {
            id: "E-102",
            type: "heatExchanger",
            name: "Gaskylare E-102",
            description: "Kylare för komprimerad gas. Kyler till kondensationstemperatur.",
            position: { x: 2, y: 0, z: -10 }
        },
        {
            id: "HV-101",
            type: "valve",
            name: "Handventil HV-101",
            description: "Avstängningsventil för returledning. Typ: Ball valve, DN40.",
            position: { x: -3, y: 0, z: -10 }
        },
        {
            id: "P-102",
            type: "pump",
            name: "Returpump P-102",
            description: "Pump för recirkulation av kondensat tillbaka till råvarukärlet. Flöde: 5 m³/h.",
            position: { x: -8, y: 0, z: -10 }
        }
    ],

    // Mediumtyper: "produkt", "gas", "luft", "vatten", "ånga"
    connections: [
        // Huvudprocess (övre raden)
        { from: "V-101", to: "P-101", medium: "vatten" },
        { from: "P-101", to: "F-101", medium: "vatten" },
        { from: "F-101", to: "R-101", medium: "vatten" },
        { from: "R-101", to: "E-101", medium: "produkt" },
        { from: "E-101", to: "C-101", medium: "produkt" },
        { from: "C-101", to: "FCV-101", medium: "produkt" },
        { from: "FCV-101", to: "V-102", medium: "produkt" },

        // Gasåtervinning + retur (nedre raden)
        { from: "C-101", to: "K-101", medium: "gas" },
        { from: "K-101", to: "E-102", medium: "gas" },
        { from: "E-102", to: "HV-101", medium: "vatten" },
        { from: "HV-101", to: "P-102", medium: "vatten" },
        { from: "P-102", to: "V-101", medium: "vatten" }
    ]
};
