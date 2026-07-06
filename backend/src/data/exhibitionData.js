const exhibitionData = {
  Partners: [
    { id: "partner-1", name: "Tata Motors", role: "Automotive Partner", business: "Automotive", booth: "P01", hall: "1", icon: "directions-bus", color: "#245BB2", accent: "#E65539" },
    { id: "partner-2", name: "Wipro", role: "Technology Partner", business: "Technology", booth: "P08", hall: "1", icon: "hub", color: "#21146B", accent: "#2F9E57", recommended: true },
    { id: "partner-3", name: "Google Cloud", role: "Cloud Partner", business: "Cloud", booth: "P14", hall: "2", icon: "cloud", color: "#4285F4", accent: "#F4B400", recommended: true },
    { id: "partner-4", name: "State Bank of India", role: "Banking Partner", business: "Finance", booth: "P22", hall: "2", icon: "account-balance", color: "#1D2B8F", accent: "#00A9E0" },
    { id: "partner-5", name: "Mahindra Electric", role: "EV Partner", business: "EV Infrastructure", booth: "P31", hall: "3", icon: "electric-car", color: "#D71920", accent: "#2F9E57", recommended: true },
    { id: "partner-6", name: "Ashok Leyland", role: "Commercial Mobility", business: "Automotive", booth: "P36", hall: "3", icon: "local-shipping", color: "#153F7A", accent: "#F4B400" },
    { id: "partner-7", name: "Jio Platforms", role: "Digital Partner", business: "Technology", booth: "P42", hall: "4", icon: "cell-tower", color: "#154FA3", accent: "#E65539" },
    { id: "partner-8", name: "Axis Bank", role: "Finance Partner", business: "Finance", booth: "P49", hall: "4", icon: "payments", color: "#97144D", accent: "#F4511E" },
  ],
  Exhibitors: [
    { id: "exhibitor-1", name: "6D Technologies", role: "Digital Solutions", business: "Technology", booth: "B11", hall: "1", icon: "donut-large", color: "#1893D1", accent: "#F4B400" },
    { id: "exhibitor-2", name: "Airconnect Infosystems", role: "Connectivity", business: "Connectivity", booth: "B18", hall: "1", icon: "air", color: "#1487C9", accent: "#E65539", recommended: true },
    { id: "exhibitor-3", name: "Airtel", role: "Telecom", business: "Connectivity", booth: "A1", hall: "1", icon: "wifi-tethering", color: "#E40000", accent: "#D71920", recommended: true },
    { id: "exhibitor-4", name: "Altera", role: "Infrastructure", business: "Infrastructure", booth: "A22 & A23", hall: "1", icon: "memory", color: "#173A74", accent: "#37A7DF", recommended: true },
    { id: "exhibitor-5", name: "Charge Grid", role: "EV Infrastructure", business: "EV Infrastructure", booth: "C07", hall: "2", icon: "ev-station", color: "#1A73E8", accent: "#2F9E57" },
    { id: "exhibitor-6", name: "FleetOps", role: "Fleet Solutions", business: "Fleet Solutions", booth: "C12", hall: "2", icon: "route", color: "#E65539", accent: "#1A73E8" },
    { id: "exhibitor-7", name: "Urban Move", role: "Mobility Platform", business: "Mobility Platform", booth: "D03", hall: "3", icon: "commute", color: "#7E4CCB", accent: "#F4B400" },
    { id: "exhibitor-8", name: "Mobility Tech", role: "Smart Transit", business: "Technology", booth: "D16", hall: "3", icon: "developer-board", color: "#128A43", accent: "#1A73E8" },
  ],
  Startup: [
    { id: "startup-1", name: "RouteIQ", role: "AI Scheduling", business: "AI", booth: "S01", hall: "5", icon: "auto-graph", color: "#008D7A", accent: "#1A73E8", recommended: true },
    { id: "startup-2", name: "Parkly", role: "Smart Parking", business: "Parking", booth: "S04", hall: "5", icon: "local-parking", color: "#F4511E", accent: "#7430C4" },
    { id: "startup-3", name: "EcoRide", role: "Shared Mobility", business: "Mobility Platform", booth: "S09", hall: "5", icon: "eco", color: "#2F9E57", accent: "#F4B400", recommended: true },
    { id: "startup-4", name: "PayTransit", role: "Ticketing Startup", business: "Ticketing", booth: "S13", hall: "5", icon: "confirmation-number", color: "#1D5FAF", accent: "#E65539" },
    { id: "startup-5", name: "VoltLoop", role: "Battery Analytics", business: "EV Infrastructure", booth: "S18", hall: "6", icon: "battery-charging-full", color: "#7430C4", accent: "#2F9E57" },
    { id: "startup-6", name: "BusMate", role: "Operator Tools", business: "Fleet Solutions", booth: "S21", hall: "6", icon: "directions-bus", color: "#DA7B00", accent: "#1A73E8" },
    { id: "startup-7", name: "MapMint", role: "Route Mapping", business: "Technology", booth: "S28", hall: "6", icon: "map", color: "#128A43", accent: "#F4511E" },
    { id: "startup-8", name: "Ticketly", role: "Fare Platform", business: "Ticketing", booth: "S33", hall: "6", icon: "qr-code-2", color: "#173A74", accent: "#37A7DF", recommended: true },
  ],
};

module.exports = exhibitionData;
