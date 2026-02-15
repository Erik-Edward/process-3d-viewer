// Exempeldata: enkel raffinaderiloop med 6 komponenter
export const processData = {
    name: "Enkel destillationsloop",
    description: "Proof-of-concept processflöde med tankar, pumpar och ventiler",

    components: [
        {
            id: "V-101",
            type: "tank",
            name: "Råvarukärl V-101",
            description: "Lagerkärl för råvara (feed). Kapacitet: 50 m³.",
            position: { x: -12, y: 0, z: 0 }
        },
        {
            id: "P-101",
            type: "pump",
            name: "Matarpump P-101",
            description: "Centrifugalpump för matning av råvara. Flöde: 10 m³/h.",
            position: { x: -8, y: 0, z: 0 }
        },
        {
            id: "E-101",
            type: "heatExchanger",
            name: "Förvärmare E-101",
            description: "Rörbuntsvärmeväxlare (shell & tube). Värmer feed med het produktström. Effekt: 150 kW.",
            position: { x: -4, y: 0, z: 0 }
        },
        {
            id: "C-101",
            type: "column",
            name: "Destillationskolonn C-101",
            description: "Fraktioneringskolonn med 5 bottnar. Tryck: 2 bar, Topp-temp: 80°C, Botten-temp: 150°C.",
            position: { x: 0, y: 0, z: 0 }
        },
        {
            id: "FCV-101",
            type: "valve",
            name: "Flödesreglerventil FCV-101",
            description: "Flödesreglerande ventil (Flow Control Valve). Typ: Globe valve, DN50.",
            position: { x: 4, y: 0, z: 0 }
        },
        {
            id: "V-102",
            type: "tank",
            name: "Produktkärl V-102",
            description: "Lagerkärl för produkt. Kapacitet: 30 m³.",
            position: { x: 8, y: 0, z: 0 }
        },
        {
            id: "HV-101",
            type: "valve",
            name: "Handventil HV-101",
            description: "Avstängningsventil för returledning. Typ: Ball valve, DN40.",
            position: { x: 8, y: 0, z: -8 }
        },
        {
            id: "P-102",
            type: "pump",
            name: "Cirkulationspump P-102",
            description: "Pump för recirkulation tillbaka till råvarukärlet. Flöde: 5 m³/h.",
            position: { x: -8, y: 0, z: -8 }
        }
    ],

    // Mediumtyper: "produkt", "gas", "luft", "vatten", "ånga"
    connections: [
        { from: "V-101", to: "P-101", medium: "vatten" },
        { from: "P-101", to: "E-101", medium: "vatten" },
        { from: "E-101", to: "C-101", medium: "vatten" },
        { from: "C-101", to: "FCV-101", medium: "produkt" },
        { from: "FCV-101", to: "V-102", medium: "produkt" },
        { from: "V-102", to: "HV-101", medium: "produkt" },
        { from: "HV-101", to: "P-102", medium: "vatten" },
        { from: "P-102", to: "V-101", medium: "vatten" }
    ]
};
