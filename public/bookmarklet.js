/**
 * Bookmarklet CAROL → HeroTOOL
 * Version complète avec extraction de données
 */

(function() {
  try {
    console.log('🔖 Bookmarklet CAROL activé');
    
    // 1. Extraire l'UUID depuis l'URL
    const uuid = window.location.pathname.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1];
    
    if (!uuid) {
      alert('❌ UUID non trouvé.\n\nAssurez-vous d\'être sur la page d\'un véhicule CAROL.\n\nURL actuelle : ' + window.location.href);
      return;
    }
    
    console.log('✅ UUID trouvé:', uuid);
    
    // 2. Chercher les données dans la page
    let vehicleData = {
      id: uuid,
      vehicle: {},
      tasks: [],
      refurbishmentNumber: '',
      status: ''
    };
    
    // Essayer de trouver les données dans __NEXT_DATA__ (Next.js)
    const nextDataScript = document.getElementById('__NEXT_DATA__');
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript.textContent);
        console.log('📦 __NEXT_DATA__ trouvé:', nextData);
        
        if (nextData.props?.pageProps) {
          vehicleData = {
            ...vehicleData,
            ...nextData.props.pageProps
          };
        }
      } catch (e) {
        console.error('Erreur parsing __NEXT_DATA__:', e);
      }
    }
    
    // Chercher dans tous les scripts JSON
    const jsonScripts = document.querySelectorAll('script[type="application/json"]');
    jsonScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data.props?.pageProps?.refurbishment) {
          vehicleData = {
            ...vehicleData,
            ...data.props.pageProps.refurbishment
          };
        }
      } catch (e) {}
    });
    
    console.log('📊 Données extraites:', vehicleData);
    
    // 3. Ouvrir HeroTOOL
    const heroToolUrl = 'https://herotool.vercel.app';
    const win = window.open(heroToolUrl, 'HeroTOOL', 'width=1400,height=900,menubar=no,toolbar=no,location=no');
    
    if (!win) {
      alert('❌ Impossible d\'ouvrir HeroTOOL.\n\nVeuillez autoriser les pop-ups pour ce site.');
      return;
    }
    
    // 4. Envoyer les données après un délai
    setTimeout(() => {
      console.log('📤 Envoi des données à HeroTOOL...');
      
      win.postMessage({
        type: 'CAROL_IMPORT',
        data: vehicleData
      }, heroToolUrl);
      
      alert('✅ Données envoyées à HeroTOOL !\n\n' +
            'UUID: ' + uuid + '\n' +
            'Véhicule: ' + (vehicleData.vehicle?.make || '?') + ' ' + (vehicleData.vehicle?.model || '?') + '\n\n' +
            'Consultez la fenêtre HeroTOOL.');
      
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur Bookmarklet:', error);
    alert('❌ Erreur : ' + error.message + '\n\nConsultez la console (F12) pour plus de détails.');
  }
})();