Ext.define('swd.util.AHP', {

	vectors: null,
	
	
	constructor: function(config) {
		config = config || {};
		
		var me = this,
			vectors = config.vectors;
		
		me.initialConfig = config;
		
		me.setVectors(vectors);
	},
	
	setVectors: function(vectors) {
		if (!Ext.isArray(vectors)) {
			Ext.Error.raise('Błędna definicja wektora.');
		}
		
		var me = this,
			n = vectors.length;
		
		if (n < 2 || n > 15) {
			Ext.Error.raise('Wielkość wektora spoza zakresu, dopuszczalny zakres [2..15].');
		}
		
		me.vectors = vectors;
	},
	
	getRatingVector: function() {
		var i, j,
			vectors = this.vectors,
			n = vectors[1].length,
			k = vectors[0].length,
			rating = [];
		
		for (j = 0; j < n; j++) {
			rating[j] = 0;
			for (i = 0; i < k; i++) {
				rating[j] += vectors[0][i]*vectors[i+1][j];
			}
		}
		
		return rating;
	}

});