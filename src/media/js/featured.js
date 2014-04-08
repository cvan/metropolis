define('featured', ['settings', 'storage', 'log'], function(settings, storage, log) {

  var console = log('featured');

  return {

    all: function() {
      // This will eventually fetch from the JSON database. For now...
      var cached = JSON.parse(storage.getItem('all_featured'));
      if (!cached) {
        cached = [
          { name: 'trenta', weight: 10 },
          { name: 'venti', weight: 8 },
          { name: 'grande', weight: 6 },
          { name: 'tall', weight: 4 },
          { name: 'nessuno', weight: 2 }
        ];
        storage.setItem('all_featured', JSON.stringify(cached));
      }
      return cached;
    },

    get: function() {
      // Retrieve a subset of the featured apps from cache. If the cache has
      // expired, regenerate a random subset and return the featured apps.
      var cached = JSON.parse(storage.getItem(this.cacheKey()))
      if (!cached) {
        cached = this.regenerate();
        this.removeYesterday();
      }
      return cached;
    },

    cacheKey: function(date) {
      // Generate a date-based cache key for the passed Date object (default: today).
      if(typeof date === 'undefined') {
        date = new Date();
      };
      return 'featured_' + date.toDateString().replace(' ', '_').toLowerCase();
    },

    regenerate: function() {
      // From the pool of featured apps, returned a randomized, weighted selection to be
      // displayed on the homepage. Store 
      console.log('Generating a new selection of featured apps.');
      var all = this.all();

      // Create a weighted array of all the available items' indexes in `all`.
      var weighted_index = [];
      for (var i = 0; i < all.length; i++) {
        for (var n = 0; n < Math.ceil(all[i].weight); n++) {
          weighted_index.push(i);
        }
      }

      // Choose the appropriate number of random unique indexes from the weighted array.
      var chosen_items = [];
      while (chosen_items.length < settings.numberFeatured) {
        var random = weighted_index[Math.floor(Math.random() * weighted_index.length)];
        if (chosen_items.indexOf(random) === -1) {
          chosen_items.push(random);
        }
      }

      // Map the chosen indexes back to their original objects.
      var featured = [];
      for (var i = 0; i < chosen_items.length; i++) {
        featured.push(all[chosen_items[i]]);
      }

      // Store and return the original objects, removing yesterday's cache.
      storage.setItem(this.cacheKey(), JSON.stringify(featured));
      return featured;

    },

    removeYesterday: function() {
      // Remove the cache for yesterday.
      console.log('Removing yesterday\'s selection of featured apps.');
      var date = new Date();
      date.setDate(date.getDate() - 1);
      var key = this.cacheKey(date);
      storage.removeItem(key);
    }

  };

});
