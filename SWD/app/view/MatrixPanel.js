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
			grids = [
				{ title: 'Macierz', id: 'Matrix', obj: matrix, editable: true },
				{ title: 'Znorm.', id: 'Matrix', obj: normalized },
				{ title: 'Wektor', id: 'Vector', obj: vector }
			];
			
		me.isCoherent = normalized.isCoherent();
		
		if (!me.isCoherent) {
			grids[0].title = me.getNotCoherentText(grids[0].title);
		}
		
		me.vector = vector;
		me.items = me.getItemsConfig(grids);
		
		me.callParent(arguments);
	},
	
	getItemsConfig: function(grids) {
		var me = this,
				items = [];
		
		Ext.Array.forEach(grids, function(grid) {
			var object = grid.obj,	// To bedzie macierz, macierz normalna lub wektor
					id = grid.id,
					config = {};
			
			Ext.apply(config, {
				xtype: 'grid',
				title: grid.title,
				// Na podstawie "id" budujemy nazwe metody do pobrania konfigu store'a
				// oraz konfigu kolumn
				store: me['get'+id+'StoreConfig'].call(me, object),
				columns: me['get'+id+'ColumnsConfig'].call(me, object, grid.editable),
				viewConfig: {
					trackOver: false
				},
				hideHeaders: true,
				columnLines: true
			});
			
			// Plugin do edycji dodajemy tylko dla macierzy wejsciowej
			if (grid.editable) {
				Ext.apply(config, {
					plugins: [
						{ 
							ptype: 'cellediting', pluginId: 'cellediting',
							listeners: {
								edit: me.onEditMatrix,
								scope: me
							}
						}
					]
				});
			}
			
			items.push(config);
		});
		
		return items;
	},
	
	onEditMatrix: function(plugi, context) {
		var me = this,
				j = context.rowIdx,										// Indeks edytoeanego wiersza
				l = context.colIdx,										// Indeks edytowanej columny
				panel = context.grid.up('tabpanel'),	// Referencja to panelu z zakladkami
				tabBar = panel.down('tabbar'),				// Referencja do paska zakladek
				matrixTab = tabBar.items.getAt(0),		// Referencja do pierwszej zakladki - macierz wejsciowa
				text = 'Macierz',
				grids,
				normalized,
				vector;
		
		// Modyfikujemy dane w macierzy
		me.matrix.items[j][l] = context.value;
		
		normalized = me.matrix.getNormalized();
		vector = normalized.getPrefVector(),
		grids = [
			{ title: 'Znorm.', id: 'Matrix', obj: normalized },
			{ title: 'Wektor', id: 'Vector', obj: vector }
		];
		
		// Wylaczamy odswierzanie strony
		Ext.suspendLayouts();
		
		// Usuwamy zakladke z macierza znormalizowana i wektorem
		panel.remove(panel.items.getAt(1));
		panel.remove(panel.items.getAt(1));
		// Dodajemy zakladki z nowo wygenerowana macierza znormalizowana
		// oraz wektorem
		panel.add(me.getItemsConfig(grids));
		
		// Aktualizujemy informacje o spojnosci oraz
		// nowy wektor
		me.isCoherent = normalized.isCoherent();
		me.vector = vector;
		
		// Sprawdzamy czy maciez po zmianach jest spojna, jezeli tak,
		// to zmieniamy kolor opisu zakladki oraz zatwierdzamy zmiany
		if (me.isCoherent) {
			matrixTab.setText(text);
			context.record.commit();
		} else {
			matrixTab.setText(me.getNotCoherentText(text));
		}
		
		// Odswierzamy strone po zmianach
		Ext.resumeLayouts(true);
		
		// Wysylamy zdarzenie 'matrixchange' aby powiadomic o zmianach
		// i umozliwic obliczenia
		me.fireEvent('matrixchange', me);
	},
	
	getNotCoherentText: function(text) {
		return '<span class="swd-notcoherent-matrix" data-qtip="Brak spójności">'+text+'</span>';
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