const ListedPlatforms = () => {
    const platforms = [
      'Spotify',
      'Apple Music',
      'YouTube Music',
      'Amazon Music',
      'Tidal',
      'Deezer',
      'Pandora',
      'SoundCloud'
    ];
    
    return (
      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-900">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Platforms
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default ListedPlatforms;