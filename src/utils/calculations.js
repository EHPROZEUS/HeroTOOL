  // Forfaits dynamiques (lustrage/plume)
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (!key) return;
    if (activeIds.has(key)) return;
    if (data.lustrage1Elem === true) {
      totalMOHeures += parseNumber(data.moQuantity || 0) || 0;
      
      // ✅ FIX: Utiliser la valeur par défaut de LUSTRAGE_ITEMS si consommableQuantity n'est pas défini
      let consQty = parseNumber(data.consommableQuantity);
      if (!consQty || consQty === 0) {
        // Chercher si on peut trouver une correspondance dans LUSTRAGE_ITEMS
        const lustrageItem = LUSTRAGE_ITEMS.find(item => key.startsWith('L1_') || item.id === key);
        if (lustrageItem) {
          consQty = parseNumber(lustrageItem.consommable || 1);
        }
      }
      
      const consPU = parseNumber(data.consommablePrixUnitaire || 1);
      totalConsommables += consQty * consPU;
      activeIds.add(key);
    }
    if (data.plume1Elem === true) {
      totalMOHeures += parseNumber(data.moQuantity || 0) || 0;
      activeIds.add(key);
    }
  });