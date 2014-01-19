Ext.define('swd.util.Matrix', {
	
	// Matrix dimension
	dim: 0,
	// Matrix ratios
	ris: [
		0, 0, 0.52, 0.89, 1.11, 1.25, 1.35, 1.40, 1.45, 1.49, 1.51, 1.54, 1.56, 1.57, 1.58
	],
	// Matrix elements
	items: null,

	
	constructor: function(config) {
		config = config || {};
		
		var me = this,
			items = config.items || [],
			normalized = config.normalized;
		
		me.initialConfig = config;
		
		me.normalized = normalized;
		me.setItems(items);
	},
	
	setItems: function(items) {
		if (!Ext.isArray(items)) {
			Ext.Error.raise('Błędna definicja macierzy.');
		}
		
		var me = this,
			j,
			n = items.length,
			cnt = 0;
		
		for (j = 0; j < n; j++) {
			if (Ext.isArray(items[j])) {
				cnt += items[j].length;
			}
		}
		
		if (cnt !== n*n) {
			Ext.Error.raise('Macierz musi być kwadratowa.');
		}
		
		if (n < 2 || n > 15) {
			Ext.Error.raise('Wymiar macierzy spoza zakresu, dopuszczalny zakres [2..15].');
		}
		
		me.dim = n;
		me.items = items;
	},
	
	getItems: function() {
		return this.items;
	},
	
	getDimension: function() {
		return this.dim;
	},
	
	getRI: function() {
		return this.ris[this.dim-1];
	},
	
	isCoherent: function() {
		var me = this;
		
		// 2x2 is always coherent
		if (me.dim === 2) {
			return true;
		}
		
		var j, ci,
			items = me.items,
			n = items.length,
			colSums = me.getColSums(),
			vector = me.getPrefVector(),
			ri = me.getRI(),
			lmax = 0;
		
		for (j = 0; j < n; j++) {
			lmax += colSums[j]*vector[j];
		}
		
		ci = (lmax-n)/(n-1);
		
		return ci/ri <= 0.1;
	},
	
	getNormalized: function() {
		var me = this,
			j, l,
			items = Ext.clone(me.items),
			n = items.length,
			colSums = me.getColSums();
		
		for (j = 0; j < n; j++) {
			for (l = 0; l < n; l++) {
				items[j][l] /= colSums[l];
			}
		}
		
		return new swd.util.Matrix({
			items: items,
			normalized: true
		});
	},
	
	getPrefVector: function() {
		var me = this;
		
		if (!me.normalized) {
			Ext.Error.raise('Nie można wyznaczyć wektora preferencji, macierz nie znormalizowana.');
		}
		
		var	j,
			items = me.items,
			n = items.length,
			vector = [];
		
		for (j = 0; j < n; j++) {
			vector[j] = me.getRowSum(j)/n;
		}
		
		return vector;
	},
	
	getColSum: function(l) {
		var sum = 0,
			j,
			items = this.items,
			n = items.length;
		
		for (j = 0; j < n; j++) {
			sum += items[j][l];
		}
		
		return sum;
	},
	
	getRowSum: function(j) {
		var sum = 0,
			l,
			items = this.items,
			n = items.length;
		
		for (l = 0; l < n; l++) {
			sum += items[j][l];
		}
		
		return sum;
	},
	
	getColSums: function() {
		var me = this,
			l,
			n = me.items.length,
			colSums = [];
		
		for (l = 0; l < n; l++) {
			colSums[l] = me.getColSum(l);
		}
		
		return colSums;
	}
});