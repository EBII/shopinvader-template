//specific Algolia search Client for currency conversion
var customSearchClient = {
    search: async function(requests) {
     try {
       var algoliaClient = algoliasearch(algolia_params.app_id, algolia_params.api_key);
       if(algolia_params.currency_rate != 1) {
         var price_key = 'price.'+default_role+'.value';

         if(typeof(requests) == 'object') {
           //Currency conversion for request
           requests = requests.map(function(request) {
             if(request.hasOwnProperty('params')) {
               if(request.params.hasOwnProperty('numericFilters')) {
                 request.params.numericFilters = request.params.numericFilters
                 .map(function(filter) {
                   if(filter.indexOf(price_key) != -1) {
                     var number_position = price_key.length +2;
                     var price = parseFloat(filter.substring(number_position));
                     filter = filter.substring(0, number_position);
                     price /= algolia_params.currency_rate;
                   }
                   return filter+String(price);
                 });
               }
             }
             return request;
           });
         }

         algoliaResults = await algoliaClient.search(requests);
         if(algoliaResults.hasOwnProperty('results')) {
           //Currency conversion for hit result
           algoliaResults.results = algoliaResults.results.map(function(result_set){
             //Hits
             if(result_set.hasOwnProperty('hits')) {
               var hits = result_set.hits.map(function(hit){
                 if(hit.hasOwnProperty('price')) {
                   if(hit.price.hasOwnProperty(default_role)) {
                     hit.price[default_role].value *= algolia_params.currency_rate;
                   }
                 }
                 return hit;
               })
             }
             //Currency conversion for facet result (used by price widget)
             if(result_set.hasOwnProperty('facets_stats')) {

                 if(result_set.facets_stats.hasOwnProperty(price_key)) {
                   for(key in result_set.facets_stats[price_key]) {
                     result_set.facets_stats[price_key][key] *= algolia_params.currency_rate;
                   }
                 }
             }
             return result_set;
           });
         }
         return algoliaResults;
      }
      else {
        var algoliaResults = await algoliaClient.search(requests);
        return algoliaResults;
      }
    }
    catch(error) {
     console.error(error);
    }
  }
}
