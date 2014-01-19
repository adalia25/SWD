Ext.define('swd.controller.Main', {
	extend: 'Ext.app.Controller',
	requires: [
		'swd.util.Matrix',
		'swd.util.AHP'
	],
	
	views: [
		'MatrixPanel',
		'RatingPanel',
		'ChartPanel'
	],
	
	refs: [
		{ ref: 'SaveBtn', selector: 'viewport > panel button[name=save]' }
	],
	
	
	init: function() {
		var me = this;
		
		me.control({
			'viewport > panel button[name=load]': {
				change: me.onChangeFile
			}
		});
		
	},
	
	getMainView: function() {
		return Ext.ComponentQuery.query('viewport > panel')[0];
	},
	
	onChangeFile: function(btn, ev) {
		var me = this,
			reader = new FileReader(),
			file = ev.target.files[0],
			data;
	
		reader.onload = function(ev) {
			try {
				data = Ext.JSON.decode(ev.target.result);
				me.loadData(data);
				with (me.getSaveBtn()) {
					setHref('data:application/json;charset=utf-8,'+encodeURIComponent(data));
					setDisabled(false);
				}
			} catch (e) {
				Ext.Msg.show({
					title: 'Błąd',
					msg: 'Niepoprawny format pliku JSON.',
					buttons: Ext.Msg.OK,
					icon: Ext.Msg.ERROR
				});
			} finally {
				btn.reset();	// Trzeba go zresetowac zeby mozna bylo wybrac ten sam plik ponownie
			}
		};
		
		reader.readAsText(file);
	},
	
	clearData: function() {
		var panel = this.getMainView();
		panel.removeAll();
	},
	
	loadData: function(data) {
		var me = this,
			panel = me.getMainView(),
			vectors = [],		// Tablica wektorow
			coherentCnt = 0,	// Licznik spojnych macierzy
			view,
			container,
			ahp;
		
		try {
			
			me.clearData();
			
			// Tworzymy widok dla macierzy preferencji
			view = me.getView('MatrixPanel').create({
				title: data.criteria.title,
				width: 250,
				height: 160,
				margin: 5,
				matrix: me.createMatrix(data.criteria.items)
			});
			// Dodajemy go do widoku glownego
			panel.add(view);
			// Zapisujemy sobie wektor
			vectors[0] = view.getPrefVector();
			// Jezeli macierz spojna to zwiekszamy
			coherentCnt += view.isMatrixCoherent() ? 1 : 0;
			
			// Tworzymy kontener na widoki porownan
			container = Ext.create('Ext.container.Container', {
				layout: 'hbox'
			});
			// Dodajemy go do widoku glownego
			panel.add(container);
			
			Ext.Array.forEach(data.comparison, function(comp, i) {
				// Tworzymy widok dla macierzy kryteriow
				view = me.getView('MatrixPanel').create({
					title: comp.title,
					width: 250,
					height: 160,
					margin: 5,
					matrix: me.createMatrix(comp.items)
				});
				// Dodajemy go do kontenera
				container.add(view);
				vectors[i+1] = view.getPrefVector();
				// Jezeli macierz spojna to zwiekszamy
				coherentCnt += view.isMatrixCoherent() ? 1 : 0;
			});
			
			// Tworzymy kontener na widok rankingu
			container = Ext.create('Ext.container.Container', {
				layout: 'hbox'
			});
			// Dodajemy go do widoku glownego
			panel.add(container);
			
			if (coherentCnt !== vectors.length) {
				Ext.Error.raise("Przynajmniej jedna macierz jest niespójna.");
			}
			
			// Tworzymy obiekt AHP, wykorzystamy go w dwoch widokach
			ahp = me.createAHP(vectors);
			
			// Tworzymy widok dla wektora rankingu
			view = me.getView('RatingPanel').create({
				title: 'Ranking',
				width: 250,
				height: 250,
				margin: 5,
				decision: data.decision,
				ahp: ahp
			});
			// Dodajemy go do kontenera
			container.add(view);
			
			// Tworzymy widok dla wykresu rankingu
			view = me.getView('ChartPanel').create({
				title: 'Wykres',
				width: 250,
				height: 250,
				margin: 5,
				decision: data.decision,
				ahp: ahp
			});
			// Dodajemy go do kontenera
			container.add(view);
			
		} catch (e) {
			Ext.Msg.show({
				title: 'Błąd',
				msg: e.message,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR
			});
		}
	},
	
	createMatrix: function(items) {
		return new swd.util.Matrix({
			items: items
		});
	},
	
	createAHP: function(items) {
		return new swd.util.AHP({
			vectors: items
		});
	}
	
});