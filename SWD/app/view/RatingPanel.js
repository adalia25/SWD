Ext.define('swd.view.RatingPanel', {
	extend: 'Ext.panel.Panel',
	

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
				xtype: 'grid',
				border: 0,
				store: me.getStoreConfig(vector),
				columns: me.getColumnsConfig(vector),
				viewConfig: {
					trackOver: false
				},
				hideHeaders: true,
				columnLines: true
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
			data[i] = [me.decision[i], vector[i]];
		}
		
		return {
			type: 'array',
			fields: ['A', 'B'],
			sorters: [
			  { property: 'B', direction: 'DESC' }
			],
			data: data
		};
	},
	
	getColumnsConfig: function() {
		return [
			{
				xtype: 'rownumberer'
		    },
			{
				dataIndex: 'A',
				flex: 1
		    },
			{
				dataIndex: 'B',
				width: 50,
				align: 'center',
				renderer: this.onRenderColumn
		    }
		];
	},
	
	onRenderColumn: function(value) {
		return Ext.isNumber(value) ? value.toFixed(2) : '?';
	}
});