Ext.define('swd.view.MatrixPanel', {
	extend: 'Ext.tab.Panel',
	requires: [
		'swd.util.Matrix'
	],
	alias: 'widget.matrixpanel',
	
	// Referencja do macierzy
	matrix: null,
	// Referencja do macierzy znormalizowanej
	normalized: null,
	

	constructor: function(config) {
		config = config || {};
		
		var me = this,
			matrix = config.matrix;
		
		if ((!matrix) || (!(matrix instanceof swd.util.Matrix))) {
			Ext.Error.raise('swd.util.Matrix expected as an "matrix" argument');
		}
		
		me.callParent([config]);
	},
	
	getMatrix: function() {
		return this.matrix;
	},
	
	isMatrixCoherent: function() {
		return this.isCoherent;
	},
	
	getPrefVector: function() {
		return this.vector;
	},
	
	initComponent: function() {
		var me = this,
			matrix = me.matrix,
			normalized = matrix.getNormalized(),
			vector = normalized.getPrefVector(),
			tabs = [
				{ title: 'Macierz', name: 'Matrix', obj: matrix, editable: true },
				{ title: 'Znorm.', name: 'Matrix', obj: normalized },
				{ title: 'Wektor', name: 'Vector', obj: vector }
			];
			
		me.isCoherent = normalized.isCoherent();
		
		if (!me.isCoherent) {
			tabs[0].title = '<span class="swd-notcoherent-matrix" data-qtip="Brak spójności">'+tabs[0].title+'</span>';
		}
		
		me.items = [];
		me.vector = vector;
		
		Ext.Array.forEach(tabs, function(tab) {
			me.items.push({
				xtype: 'grid',
				title: tab.title,
				store: me['get'+tab.name+'StoreConfig'].call(me, tab.obj),
				columns: me['get'+tab.name+'ColumnsConfig'].call(me, tab.obj, tab.editable),
				viewConfig: {
					trackOver: false
				},
				plugins: [
					{ ptype: 'cellediting', pluginId: 'cellediting' }
				],
				hideHeaders: true,
				columnLines: true
			});
		});
		
		me.callParent(arguments);
	},
	
	getMatrixStoreConfig: function(matrix) {
		var items = matrix.getItems(),
			n = matrix.getDimension(),
			fields = [],
			i;
		
		for (i = 0; i < n; i++) {
			fields[i] = String.fromCharCode(i+65);
		}
		
		return {
			type: 'array',
			fields: fields,
			data: items
		};
	},
	
	getMatrixColumnsConfig: function(matrix, editable) {
		var me = this,
			n = matrix.getDimension(),
			columns = [],
			i;
		
		for (i = 0; i < n; i++) {
			columns[i] = Ext.apply({}, {
				dataIndex: String.fromCharCode(i+65),
				flex: 1,
				align: 'center',
				renderer: me.onRenderColumn,
				editor: editable ? me.getEditorConfig() : false
			});
		}
		
		return columns;
	},
	
	getVectorStoreConfig: function(vector) {
		var n = vector.length,
			data = [],
			i;
		
		for (i = 0; i < n; i++) {
			data[i] = [vector[i]];
		}
		
		return {
			type: 'array',
			fields: ['A'],
			data: data
		};
	},
	
	getVectorColumnsConfig: function() {
		return [
			{
				dataIndex: 'A',
				width: 50,
				align: 'center',
				renderer: this.onRenderColumn
		    }
		];
	},
	
	getEditorConfig: function() {
		return {
			xtype: 'numberfield',
			minValue: 0,
			maxValue: 9,
			step: 0.1
		};
	},
	
	onRenderColumn: function(value) {
		return Ext.isNumber(value) ? value.toFixed(2) : '?';
	}
});