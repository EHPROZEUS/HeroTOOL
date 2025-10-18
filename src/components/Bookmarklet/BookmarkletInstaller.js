import React, { useState } from 'react';

const BookmarkletInstaller = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  // Code du Bookmarklet (minifié pour l'URL)
  const bookmarkletCode = `javascript:(function(){try{const uuid=window.location.pathname.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1];if(!uuid){alert('❌ UUID non trouvé.\\n\\nAssurez-vous d\\'être sur la page d\\'un véhicule CAROL.');return;}let vehicleData={id:uuid,vehicle:{},tasks:[]};const scripts=document.querySelectorAll('script');scripts.forEach(script=>{try{const text=script.textContent;if(text.includes('refurbishment')||text.includes('vehicle')){const match=text.match(/({[^]*})/);if(match){const data=JSON.parse(match[1]);if(data.props?.pageProps){vehicleData=data.props.pageProps;}}}}catch(e){}});const win=window.open('https://herotool.vercel.app','HeroTOOL','width=1400,height=900');setTimeout(()=>{win.postMessage({type:'CAROL_IMPORT',data:vehicleData},'https://herotool.vercel.app');alert('✅ Données envoyées à HeroTOOL !');},2000);}catch(error){alert('❌ Erreur: '+error.message);}})();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    alert('✅ Code copié !\n\nCollez-le dans l\'URL d\'un nouveau favori.');
  };

  return (
    <div className="mb-6 p-5 rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-900">
          🔖 Bookmarklet CAROL → HeroTOOL
        </h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
        >
          {showInstructions ? '📖 Masquer aide' : '❓ Comment ça marche ?'}
        </button>
      </div>

      {showInstructions && (
        <div className="mb-4 p-4 bg-purple-100 border-2 border-purple-300 rounded-lg text-sm">
          <p className="font-bold text-purple-900 mb-2">
            📚 Qu'est-ce qu'un Bookmarklet ?
          </p>
          <p className="text-purple-800 mb-3">
            Un Bookmarklet est un petit outil installé dans vos favoris qui permet d'extraire 
            automatiquement les données depuis CAROL et les envoyer à HeroTOOL. 
            Pas besoin d'API, pas de problème de CORS !
          </p>
          <p className="font-bold text-purple-900 mb-2">
            🎯 Comment l'utiliser ?
          </p>
          <ol className="list-decimal ml-5 text-purple-800 space-y-1">
            <li>Installez le Bookmarklet (instructions ci-dessous)</li>
            <li>Allez sur une page véhicule dans CAROL</li>
            <li>Cliquez sur le Bookmarklet dans votre barre de favoris</li>
            <li>✨ Les données sont automatiquement importées dans HeroTOOL !</li>
          </ol>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border-2 border-purple-200 mb-4">
        <p className="font-bold text-purple-900 mb-3">
          📥 Installation (choisissez votre méthode) :
        </p>

        {/* Méthode 1 : Glisser-déposer */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-purple-300">
          <p className="font-semibold text-purple-900 mb-2">
            ✨ Méthode 1 : Glisser-déposer (FACILE)
          </p>
          <div className="flex items-center gap-3">
            
              href={bookmarkletCode}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-center hover:shadow-lg transition-all cursor-move inline-block"
              onClick={(e) => e.preventDefault()}
            >
              📥 Import CAROL
            </a>
            <div className="flex-1 text-sm text-purple-700">
              <p className="font-semibold">👆 Glissez ce bouton vers votre barre de favoris !</p>
              <p className="text-xs text-purple-600 mt-1">
                (Maintenez le bouton enfoncé et déplacez-le vers le haut)
              </p>
            </div>
          </div>
        </div>

        {/* Méthode 2 : Copier-coller */}
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
          <p className="font-semibold text-yellow-900 mb-2">
            📋 Méthode 2 : Copier-coller
          </p>
          <ol className="list-decimal ml-5 text-sm text-yellow-800 space-y-1 mb-3">
            <li>Cliquez sur "Copier le code" ci-dessous</li>
            <li>Créez un nouveau favori dans votre navigateur</li>
            <li>Nom : <code className="bg-yellow-100 px-1">📥 Import CAROL</code></li>
            <li>URL : Collez le code copié</li>
            <li>Sauvegardez !</li>
          </ol>
          <button
            onClick={copyToClipboard}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
          >
            📋 Copier le code
          </button>
        </div>

        {/* Méthode 3 : Instructions détaillées par navigateur */}
        <details className="p-3 bg-gray-50 rounded-lg border-2 border-gray-300">
          <summary className="font-semibold text-gray-900 cursor-pointer hover:text-purple-600">
            🌐 Instructions détaillées par navigateur
          </summary>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="font-bold text-blue-900">Chrome / Edge :</p>
              <ol className="list-decimal ml-5 mt-1">
                <li>Clic droit sur la barre de favoris → "Ajouter une page"</li>
                <li>Nom : <code>📥 Import CAROL</code></li>
                <li>URL : Collez le code</li>
              </ol>
            </div>
            <div className="p-2 bg-orange-50 rounded border border-orange-200">
              <p className="font-bold text-orange-900">Firefox :</p>
              <ol className="list-decimal ml-5 mt-1">
                <li>Ctrl+Shift+O → Gérer les marque-pages</li>
                <li>Nouveau marque-page</li>
                <li>Emplacement : Collez le code</li>
              </ol>
            </div>
            <div className="p-2 bg-purple-50 rounded border border-purple-200">
              <p className="font-bold text-purple-900">Safari :</p>
              <ol className="list-decimal ml-5 mt-1">
                <li>Marque-pages → Ajouter un signet</li>
                <li>Éditez l'adresse et collez le code</li>
              </ol>
            </div>
          </div>
        </details>
      </div>

      {/* Mode d'emploi */}
      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
        <p className="font-bold text-green-900 mb-2">
          ✅ Mode d'emploi :
        </p>
        <ol className="list-decimal ml-5 text-sm text-green-800 space-y-1">
          <li>Allez sur CAROL et ouvrez la page d'un véhicule</li>
          <li>Cliquez sur le Bookmarklet <code className="bg-green-100 px-1">📥 Import CAROL</code> dans vos favoris</li>
          <li>Une fenêtre HeroTOOL s'ouvre avec les données importées</li>
          <li>🎉 C'est tout !</li>
        </ol>
      </div>
    </div>
  );
};

export default BookmarkletInstaller;