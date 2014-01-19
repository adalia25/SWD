Ext.define('swd.view.ChartPanel', {
	extend: 'Ext.panel.Panel',
	
	layout: 'fit',
	

	// Referencja do AHP
	ahp: null,
	// Tablica decyzji
	decision: null,
	
	
	constructor: function(config) {
		config = config || {};
		
		var me = this,
			ahp = config.ahp;
			//decision = config.decision;
		
		if ((!ahp) || (!(ahp instanceof swd.util.AHP))) {
			Ext.Error.raise('swd.util.AHP expected as an "ahp" argument');
		}
		
		me.callParent([config]);
	},
	
	initComponent: function() {
		var me = this,
			vector = me.ahp.getRatingVector();
		
		me.items = [
			{
				xtype: 'chart',
				store: me.getStoreConfig(vector),
	            animate: true,
	            shadow: true,
	            theme: 'Base:gradients',
	            series: [
	                {
		                type: 'pie',
		                field: 'rating',
		                showInLegend: false,
		                highlight: {
		                  segment: {
		                    margin: 20
		                  }
		                },
		                label: {
		                    field: 'decision',
		                    display: 'rotate',
		                    contrast: true
		                    //font: '18px Arial'
		                }
		            }
	            ]
			}
		];
		
		me.callParent(arguments);
	},
	
	getStoreConfig: function(vector) {
		var me = this,
			n = vector.length,
			data = [],
			i;
		
		for (i = 0; i < n; i++) {
			data[i] = { 
				decision: me.decision[i],
				rating: vector[i]
			};
		}
		
		return {
			type: 'store',
			fields: ['decision', 'rating'],
			sorters: [
			  { property: 'rating', direction: 'DESC' }
			],
			data: data
		};
	}
	
});